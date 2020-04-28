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

@injectable()
export class UserModel {

  constructor(
    private client: DgraphClient
  ) { }

  async fetchByID(id: string, projection: Projection, {
    queryName = 'q',
  } = {}) {
    const query = new Query('user', queryName)
      .func('uid($id)')
      .project(projection)
      .vars({ id: ['string', id] });

    return this.client
      .newTxn()
      .queryWithVars(query.toString(), query.queryVarsObj)
      .then(extractPath([queryName, 0]));
  }

  async fetchByAuthSub(sub: string, projection: Projection, {
    queryName = 'q',
  } = {}) {
    const query = new Query('authData', queryName)
      .func('eq(AuthData.sub, $sub)')
      .project({ user: projection })
      .vars({ sub: ['string', sub] });

    return this.client
      .newTxn()
      .queryWithVars(query.toString(), query.queryVarsObj)
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
    console.log(result.getJson())
  }
}
