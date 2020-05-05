import { injectable } from 'tsyringe';
import { DgraphClient, Mutation, Request as DgraphRequest } from 'dgraph-js';
import * as R from 'ramda';
import { PartialBy, User, AuthData, AuthProvider } from '../types';
import {
  Projection,
  Query,
  setVarsForRequest,
  extractPath,
} from './utils';

interface UserCreateArg extends Omit<User, 'id' | 'authData'> {
  id?: User['id'];
  authData: Omit<AuthData, 'id' | 'provider'> & {
    id?: AuthData['id'];
    provider: PartialBy<AuthProvider, 'id'>;
  };
}

export const userProjections = {
  public: {
    id: 1,
    username: 1,
    fullName: 1,
    followsCount: 'count(User.follows)',
    followersCount: 'count(User.followers)',
    postsCount: 'count(User.posts)',
  },
  general: {
    id: 1,
    email: 1,
    username: 1,
    fullName: 1,
    followsCount: 'count(User.follows)',
    followersCount: 'count(User.followers)',
    postsCount: 'count(User.posts)',
  }
};

@injectable()
export class UserModel {
  constructor(
    private client: DgraphClient
  ) { }

  async runQueries(...queries: Query[]) {
    return Query.run(this.client, ...queries)
      .then(x => x.getJson());
  }

  async runQuery(query: Query) {
    return this.runQueries(query);
  }

  async fetchByID(id: string, projection: Projection, {
    queryName = 'q',
  } = {}): Promise<any> {
    return new Query('user', queryName)
      .func('uid($id)')
      .project(projection)
      .vars({ id: ['string', id] })
      .run(this.client)
      .then(extractPath([queryName, 0]))
  }

  async fetchByAuthSub(sub: string, projection: Projection, {
    queryName = 'q',
  } = {}): Promise<any> {
    return new Query('authData', queryName)
      .func('eq(AuthData.sub, $sub)')
      .project({ user: projection })
      .vars({ sub: ['string', sub] })
      .run(this.client)
      .then(extractPath([queryName, 0, 'user']));
  }

  async create(user: UserCreateArg) {
    if (!user.authData) {
      throw Error();
    }

    const request = new DgraphRequest();
    request.setQuery(`query q($userEmail: string, $authProviderName: string, $authDataSub: string) {
      authProvider(func: eq(AuthProvider.name, $authProviderName)) { authProviderID as uid }
      authData(func: eq(AuthData.sub, $authDataSub)) { authDataID as uid }
      user(func: eq(User.email, $userEmail)) { userID as uid }
    }`);

    setVarsForRequest(request.getVarsMap(), {
      userEmail: user.email,
      authProviderName: user.authData.provider.name,
      authDataSub: user.authData.sub,
    });

    // Run mutation.
    const mu = new Mutation();
    mu.setSetJson({ set: [{
      'dgraph.type': 'User',
      'uid': 'uid(userID)',
      'User.email': user.email,
      'User.username': user.username,
      'User.fullName': user.fullName,
      'User.authData': {
        'uid': 'uid(authDataID)',
        'dgraph.type': 'AuthData',
        'AuthData.sub': user.authData.sub,
        'AuthData.user': 'uid(userID)',
        'AuthData.provider': {
          'dgraph.type': 'AuthProvider',
          'uid': 'uid(authProviderID)',
          'AuthProvider.name': user.authData.provider.name,
        },
      },
    }] });

    request.addMutations(mu);
    request.setCommitNow(true);

    const txn = this.client.newTxn();

    const result = await txn.doRequest(request);
  }

  async setFollow(
    srcID: string,
    targetUsername: string,
    follow = true
  ) {
    const request = new DgraphRequest();

    const query = new Query('user', 'q')
      .func('eq(User.username, $username)')
      .vars({
        username: ['string', targetUsername],
      })
      .project({
        targetID: 'targetID as uid',
      });
    request.setQuery(query.toString());

    setVarsForRequest(request.getVarsMap(), query.queryVarsObj);

    const mu = new Mutation();
    mu.setCond('@if(eq(len(targetID), 1))');
    mu[follow ? 'setSetJson' : 'setDeleteJson']([
      {
        'uid': srcID,
        'User.follows': {
          uid: 'uid(targetID)',
        },
      },
      {
        'uid': 'uid(targetID)',
        'User.followers': {
          uid: srcID,
        },
      },
    ]);

    request.addMutations(mu);
    request.setCommitNow(true);

    const txn = this.client.newTxn();

    const result = await txn.doRequest(request);
    const targetID = R.path(['q', 0, 'targetID'], result.getJson());

    if (!targetID) {
      throw Error('user_not_found');
    }

    return targetID;
  }

  async follow(srcID: string, targetUsername: string) {
    return this.setFollow(srcID, targetUsername, true);
  }

  async unfollow(srcID: string, targetUsername: string) {
    return this.setFollow(srcID, targetUsername, false);
  }
}
