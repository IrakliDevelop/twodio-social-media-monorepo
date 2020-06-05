import { DgraphClient, Mutation, Request as DgraphRequest } from 'dgraph-js';
import { Query, extractPath, Projection } from '../dgraph';
import { QueryOptions } from './utils';
import * as queries from './queries';

export class BaseModel {
  constructor(
    protected rootType: string,
    protected client: DgraphClient
  ) { }

  runExtract(...path: any[]) {
    const client = this.client;
    return (query: Query) => query
      .run(client)
      .then(extractPath([query.getName(), ...path]));
  }

  async runQuery(query: Query, path: string[] = []) {
    return this.runExtract(...path)(query);
  }

  async runQueries(...queryList: Query[]) {
    return Query.run(this.client, ...queryList)
      .then(x => x.getJson());
  }

  fetchByIDQuery(
    id: string,
    projection: Projection,
    opts: Partial<QueryOptions> = {}
  ): Query {
    return queries.fetchByID(this.rootType, projection, opts, id);
  }

  async fetchByID(
    id: string,
    projection: Projection,
    opts: Partial<QueryOptions> = {},
    path: any[] = []
  ): Promise<any> {
    return this.fetchByIDQuery(id, projection, opts)
      .call(this.runExtract(0, ...path));
  }
}
