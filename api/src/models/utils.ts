import * as jspb from 'google-protobuf';
import R from 'ramda';
import * as types from '../types';

export type ProjectionType = types.ObjectOrValue<string | boolean | 0 | 1>;
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
  Object.keys(vars).forEach(k => varsMap.set('$' + k, vars[k]));
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

class Projection {
  constructor(
    private rootType: string,
    private projection: ProjectionType
  ) { }

  private *genLines(
    obj: ProjectionType,
    path: string[]
  ): IterableIterator<[number, string]> {
    for (const [key, val] of Object.entries(obj)) {
      if (!val) {
        continue;
      }
      if (typeof val === 'string') {
        yield [path.length, `${key}: ${val}`];
      } else if (['number', 'boolean'].includes(typeof val)) {
        yield [path.length, `${key}: ${keyActualField(path, key)}`];
      } else {
        yield [path.length, `${key}: ${keyActualField(path, key)} {`];
        yield *this.genLines(val as any, [...path, key]);
        yield [path.length, '}'];
      }
    }
  }

  lines() {
    return this.genLines(this.projection, [this.rootType]);
  }

  toString(extraDepth = 0) {
    return Array.from(this.lines())
      .map(([depth, line]) => indenter(depth + extraDepth)(line))
      .join('\n');
  }
}

interface QueryFuncArgs {
  first?: number;
  offset?: number;
  after?: number;
}

export class Query {
  private queryFunc?: string;
  private projection?: Projection;
  private queryVars?: QueryVars;
  private funcArgs: QueryFuncArgs = {};

  constructor(
    private rootType: string,
    private queryName: string
  ) { }

  func(func: string) {
    this.queryFunc = func;
    return this;
  }

  project(projection: ProjectionType) {
    this.projection = new Projection(this.rootType, projection);
    return this;
  }

  vars(vars: QueryVars) {
    this.queryVars = vars;
    return this;
  }

  first(first?: number) {
    this.funcArgs.first = first;
    return this;
  }

  offset(offset?: number) {
    this.funcArgs.offset = offset;
    return this;
  }

  after(after?: number) {
    this.funcArgs.after = after;
    return this;
  }

  private get varsStr() {
    return Object.entries(this.queryVars || {})
      .map(([key, [type]]) => `$${key}: ${type}`)
      .join(', ');
  }

  private get funcArgsStr() {
    return Object.entries(this.funcArgs)
      .map(x => x.join(': '))
      .join(', ')
      .trim();
  }

  private buildQueryStr(extraDepth = 0) {
    const fields = (this.projection as Projection).toString(extraDepth);
    const indent = indenter(extraDepth);
    const funcFullStr = [
      `func: ${this.queryFunc}`,
      this.funcArgsStr,
    ].filter(x => x).join(', ');

    return indent(`${this.queryName}(${funcFullStr}) {\n`)
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
