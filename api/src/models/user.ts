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

  async fetchOrAdd(user: types.PartialBy<types.User, 'id'>) {
    if (!user.authData) {
      throw Error();
    }

    const request = new DgraphRequest();
    request.setQuery(`query q($userEmail: string, $authProviderName: string, $authDataSub: string) {
      authProvider as var(func: eq(AuthProvider.name, $authProviderName))
      authData as var(func: eq(AuthData.sub, $authDataSub))
      user as var(func: eq(User.email, $userEmail))
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
      'uid': Uid('user'),
      'User.email': user.email,
      'User.authData': {
        'dgraph.type': 'AuthData',
        'AuthData.sub': user.authData.sub,
        'AuthData.user': UidDep('user'),
        'AuthData.provider': {
          'dgraph.type': 'AuthProvider',
          'AuthProvider.name': user.authData.provider.name,
        },
      },
    }] });
    mu.setCond('@if(eq(len(user), 0) AND eq(len(authData), 0) AND eq(len(authProvider), 0))');
    mu.getSetNquads();

    request.addMutations(mu);
    request.setCommitNow(true);

    const txn = this.client.newTxn();

    const result = await txn.doRequest(request);
  }
}
