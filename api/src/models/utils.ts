import * as jspb from 'google-protobuf';
import { DgraphClient } from 'dgraph-js';
import R from 'ramda';
import { ObjectOrValue } from '../types';

export type RawProjection = ObjectOrValue<Edge | string | boolean | number>;
export type Projection = Edge | RawProjection;
export type QueryVarType = 'int' | 'float' | 'string' | 'bool';
export type QueryVars = {
  [key: string]: Parameters<(type: QueryVarType, value: any) => 0>
};

function indenter(depth = 0, indentation = '  ') {
  const prefix = indentation.repeat(depth);
  return (str = ''): string => prefix + str;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function setVarsForRequest(
  varsMap: jspb.Map<string, string>,
  vars: Record<string, any>
) {
  Object.keys(vars).forEach(k => varsMap.set(
    !k.startsWith('$') ? '$' + k : k,
    vars[k]
  ));
  return varsMap;
}

// extract json from dgraph query result and return json on path
export const extractPath = R.curry(path => R.pipe(
  R.invoker(0, 'getJson'),
  R.path(path)
));

export interface ArgsData {
  func?: string;
  first?: number;
  offset?: number;
  after?: string;
  orderasc?: string;
  orderdesc?: string;
}

export type EdgeArgs = Omit<ArgsData, 'func'>;
export type QueryArgs = ArgsData;

/** func, pagination and sorting */
export class Args {
  constructor(
    private args: ArgsData = {}
  ) { }

  setArg<K extends keyof ArgsData>(key: K, val: ArgsData[K]) {
    this.args[key] = val;
  }

  get func() { return this.args.func; }
  get first() { return this.args.first; }
  get offset() { return this.args.offset; }
  get after() { return this.args.after; }
  get orderAsc() { return this.args.orderasc; }
  get orderDesc() { return this.args.orderdesc; }

  length() {
    return Object.values(this.args)
      .filter(x => x)
      .length;
  }

  toString() {
    return Object.entries(this.args)
      .filter(x => x[1])
      .map(x => x.join(': '))
      .join(', ')
      .trim();
  }
}

export class Edge {
  protected args: Args = new Args();
  protected _filter?: string;

  static fromRaw(
    rootType: string,
    projection: Projection
  ): Edge {
    if (projection instanceof Edge) {
      return projection;
    }
    return new Edge(rootType, projection);
  }

  constructor(
    protected type: string,
    protected edges: RawProjection
  ) {
    this.type = capitalize(this.type);
  }

  withArgs(args: Args | EdgeArgs) {
    if (args instanceof Args)
      this.args = args;
    else
      this.args = new Args(args);
    return this;
  }

  first(val: EdgeArgs['first']) {
    this.args.setArg('first', val);
    return this;
  }

  offset(val: EdgeArgs['offset']) {
    this.args.setArg('offset', val);
    return this;
  }

  after(val: EdgeArgs['after']) {
    this.args.setArg('after', val);
    return this;
  }

  orderAsc(field?: string) {
    this.args.setArg('orderasc', field);
    return this;
  }

  orderDesc(field?: string) {
    this.args.setArg('orderdesc', field);
    return this;
  }

  filter(filter: string) {
    this._filter = filter;
    return this;
  }

  keyToField(key: string) {
    if (['id', 'uid'].includes(key))
      return 'uid';

    return `${this.type}.${key}`;
  }

  toString(extraDepth = 0): string {
    const rootIndent = indenter(extraDepth);
    const indent = indenter(extraDepth + 1);

    const projectionLines = Object.entries(this.edges)
      .filter(([_, val]) => !!val)
      .map(([key, val]) => {
        if (typeof val === 'string')
          return `${key}: ${val}`;

        const field = this.keyToField(key);
        const keyToFieldStr = `${key}: ${field}`;
        if (['boolean', 'number'].includes(typeof val))
          return keyToFieldStr;

        if (!(val instanceof Edge))
          val = new Edge(key, val as any);

        return `${keyToFieldStr} ${val.toString(extraDepth + 1).trim()}`;
      })
      .map(x => indent(x));

    const argsStr = !this.args.length() ? ''
      : `(${this.args.toString()}) `;

    const filterStr = !this._filter ? ''
      : `@filter(${this._filter}) `;

    return [
      rootIndent(`${argsStr}${filterStr}{`.trim()),
      ...projectionLines,
      rootIndent('}'),
    ].join('\n');
  }
}

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

  /** set query name */
  name(name: string) {
    this.queryName = name;
    return this;
  }

  withArgs(args: Args | QueryArgs) {
    return super.withArgs(args);
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

