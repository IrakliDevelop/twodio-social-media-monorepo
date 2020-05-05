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

const indenter = (depth = 0, indentation = '  ') => {
  const prefix = indentation.repeat(depth);
  return (str: string = '') => prefix + str;
};

export function capitalize(s: string) {
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

// const Uid = (uid: string) => '_:' + uid;
// const UidDep = (uid: string) => ({ uid: Uid(uid) });

const keyActualField = (path: string[], key: string) => {
  if (key === 'id') {
    return 'uid';
  }
  const type = capitalize(R.last(path) as string);
  return `${type}.${key}`;
};

interface EdgeArgs {
  first?: number;
  offset?: number;
  after?: string;
  orderasc?: string;
  orderdesc?: string;
}

abstract class CommonEdge {
  /** pagination and sorting args */
  private args: EdgeArgs = {};

  first(first?: number) {
    this.args.first = !first ? undefined : Math.max(1, first);
    return this;
  }

  offset(offset?: number) {
    this.args.offset = offset;
    return this;
  }

  after(after?: string) {
    this.args.after = after;
    return this;
  }

  orderAsc(field?: string) {
    this.args.orderasc = field;
    return this;
  }

  orderDesc(field?: string) {
    this.args.orderdesc = field;
    return this;
  }

  argsStr() {
    return Object.entries(this.args)
      .filter(x => x[1])
      .map(x => x.join(': '))
      .join(', ')
      .trim();
  }
}

export class Edge extends CommonEdge {
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
    private rootType: string,
    private edge: RawProjection
  ) {
    super();
  }

  private *genLines(
    edge: Projection,
    path: string[]
  ): IterableIterator<[number, string]> {
    if (edge instanceof Edge) {
      for (const [depth, line] of edge.lines()) {
        yield [depth + path.length - 1, line];
      }
      return;
    }
    for (const [key, val] of Object.entries(edge)) {
      if (!val) {
        continue;
      }
      if (typeof val === 'string') {
        yield [path.length, `${key}: ${val}`];
      } else if (['number', 'boolean'].includes(typeof val)) {
        yield [path.length, `${key}: ${keyActualField(path, key)}`];
      } else {
        const field = keyActualField(path, key);
        let argsStr = val instanceof Edge && val.argsStr();
        argsStr = !argsStr ? '' : `(${argsStr})`;
        yield [path.length, `${key}: ${field} ${argsStr}{`];
        yield *this.genLines(val as any, [...path, key]);
        yield [path.length, '}'];
      }
    }
  }

  lines() {
    return this.genLines(this.edge, [this.rootType]);
  }

  toString(extraDepth = 0) {
    return Array.from(this.lines())
      .map(([depth, line]) => indenter(depth + extraDepth)(line))
      .join('\n');
  }
}

export class Query extends CommonEdge {
  private queryFunc?: string;
  private projection?: Edge;
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
      ...queries.map(x => x.toString().slice(2, -2)),
      '}',
    ].join('\n');

    const txn = client.newTxn();

    return (() => {
      if (hasVars) {
        return txn.queryWithVars(queryStr, varsQuery.queryVarsObj)
      } else {
        return txn.query(queryStr);
      }
    })();
  }

  constructor(
    private rootType: string,
    private queryName: string = 'q'
  ) {
    super();
  }

  asVar() {
    this.isVar = true;
    return this;
  }

  func(func: string) {
    this.queryFunc = func;
    return this;
  }

  project(projection: Projection) {
    this.projection = Edge.fromRaw(this.rootType, projection);
    return this;
  }

  vars(vars: QueryVars) {
    this.queryVars = vars;
    return this;
  }

  private get varsStr() {
    return Object.entries(this.queryVars || {})
      .map(([key, [type]]) => `$${key}: ${type}`)
      .join(', ');
  }

  private get queryNameStr() {
    if (this.isVar && this.queryName !== 'q')
      return `${this.queryName} as var`;
    else if (this.isVar)
      return 'var';
    else
      return this.queryName || 'q';
  }

  private buildQueryStr(extraDepth = 0) {
    const fields = (this.projection as Edge).toString(extraDepth);
    const indent = indenter(extraDepth);
    const funcFullStr = [
      `func: ${this.queryFunc}`,
      this.argsStr(),
    ].filter(x => x).join(', ');

    return indent(`${this.queryNameStr}(${funcFullStr}) {\n`)
                + `${fields}\n${indent('}')}`;
  }

  private buildQueryStrWithVars() {
    const hasVars = this.queryVars && Object.keys(this.queryVars).length;
    const defineVarLine = hasVars && `query ${this.queryName}(${this.varsStr}) `;

    return (defineVarLine || '') + `{\n${this.buildQueryStr(1)}\n}`;
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
    if (!this.queryFunc) {
      throw Error('queryFunc not defined');
    }
    if (!this.projection) {
      throw Error('projection not defined');
    }

    return this.buildQueryStrWithVars();
  }
}
