import { ObjectOrValue } from '../types';
import { capitalize, indenter } from './common';
import { Args, EdgeArgs } from './args';

export type RawProjection = ObjectOrValue<Edge | string | boolean | number>;
export type Projection = Edge | RawProjection;

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

  call<T>(this: T, func: (obj: T) => void) {
    return func(this);
  }

  apply<T>(this: T, func: (obj: T) => void) {
    func(this);
    return this;
  }

  withArgs(args: Args) {
    this.args = args;
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
