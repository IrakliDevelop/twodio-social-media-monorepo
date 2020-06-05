import { DgraphClient } from 'dgraph-js';
import { indenter } from './common';
import { Edge, Projection } from './edge';

export type QueryVarType = 'int' | 'float' | 'string' | 'bool';
export type QueryVars = {
  [key: string]: Parameters<(type: QueryVarType, value: any) => 0>
};

export class Query extends Edge {
  private queryVars?: QueryVars;
  private isVar = false;

  static combinedVars(...queries: Query[]) {
    return queries.reduce((r, x) => Object.assign(r, x.queryVars), {});
  }

  static run(client: DgraphClient, ...queries: Query[]) {
    const vars = Query.combinedVars(...queries);
    const hasVars = !!Object.keys(vars).length;
    queries.forEach(x => x.vars({}));

    const varsQuery = new Query('', '').vars(vars);
    const queryStr = [
      (hasVars && `query combined(${varsQuery.varsStr}) `) + '{',
      ...queries.map(x => x.queryStr(1)),
      '}',
    ].join('\n');

    const txn = client.newTxn();

    console.log('Query:', queryStr, varsQuery.queryVarsObj);
    return (() => {
      if (hasVars) {
        return txn.queryWithVars(queryStr, varsQuery.queryVarsObj)
      } else {
        return txn.query(queryStr);
      }
    })();
  }

  constructor(
    type: string,
    protected queryName = 'q'
  ) {
    super(type, {});
  }

  getName() {
    return this.queryName;
  }

  /** set query name */
  name(name: string) {
    this.queryName = name;
    return this;
  }

  func(func: string) {
    this.args.setArg('func', func);
    return this;
  }

  project(projection: Projection) {
    if (projection instanceof Edge)
      Object.assign(this, projection);
    else
      this.edges = projection;

    return this;
  }

  asVar() {
    this.isVar = true;
    return this;
  }

  vars(vars: QueryVars) {
    this.queryVars = vars;
    return this;
  }

  private get queryNameStr() {
    if (this.isVar && this.queryName !== 'q')
      return `${this.queryName} as var`;
    else if (this.isVar)
      return 'var';
    else
      return this.queryName || 'q';
  }

  get varsStr() {
    return Object.entries(this.queryVars || {})
      .map(([key, [type]]) => `$${key}: ${type}`)
      .join(', ');
  }

  projectionStr(extraDepth = 0) {
    return super.toString(extraDepth);
  }

  queryStr(extraDepth = 0) {
    const indent = indenter(extraDepth);

    return indent(
      this.queryNameStr
      + this.projectionStr(extraDepth).trim()
    );
  }

  private queryWithVarsStr() {
    const hasVars = this.queryVars && Object.keys(this.queryVars).length;
    const defineVarLine = hasVars && `query ${this.queryName}(${this.varsStr}) `;

    return (defineVarLine || '') + `{\n${this.queryStr(1)}\n}`;
  }

  get queryVarsObj() {
    return Object.entries(this.queryVars || {})
      .reduce((r, [key, [, val]]) => {
        r['$' + key] = val;
        return r;
      }, {} as Record<string, any>);
  }

  run(client: DgraphClient) {
    return Query.run(client, this);
  }

  toString(): string {
    if (!this.args.func) {
      throw Error('queryFunc not defined');
    }
    if (!this.edges) {
      throw Error('projection not defined');
    }

    return this.queryWithVarsStr();
  }
}
