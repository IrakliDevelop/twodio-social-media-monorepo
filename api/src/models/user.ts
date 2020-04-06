import { injectable } from 'tsyringe';
import { DgraphClient, Mutation, Request as DgraphRequest } from 'dgraph-js';
import * as jspb from 'google-protobuf';
import * as types from '../types';

function setVars(varsMap: jspb.Map<string, string>, vars: Record<string, any>) {
  Object.keys(vars).forEach(k => varsMap.set('$' + k, vars[k]));
  return varsMap;
}

const Uid = (uid: string) => '_:' + uid;
const UidDep = (uid: string) => ({ uid: Uid(uid) });

@injectable()
export default class {

  constructor(
    private client: DgraphClient
  ) { }

  async create(user: types.PartialBy<types.User, 'id'>) {
    if (!user.authData) {
      throw Error();
    }

    const request = new DgraphRequest();
    request.setQuery(`query q($userEmail: string, $authProviderName: string, $authDataSub: string) {
      authProvider(func: eq(AuthProvider.name, $authProviderName)) { authProviderID as uid }
      authData(func: eq(AuthData.sub, $authDataSub)) { authDataID as uid }
      user(func: eq(User.email, $userEmail)) { userID as uid }
    }`);

    setVars(request.getVarsMap(), {
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
  }
}
