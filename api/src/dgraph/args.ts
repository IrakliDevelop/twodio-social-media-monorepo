import * as R from 'ramda';

export interface ArgsDataParsed {
  func?: string;
  first?: number;
  offset?: number;
  after?: string;
  orderasc?: string;
  orderdesc?: string;
}

export interface ArgsData extends Omit<ArgsDataParsed, 'first' | 'offset'> {
  first?: string | number;
  offset?: string | number;
}

export type EdgeArgs = Omit<ArgsData, 'func'>;
export type QueryArgs = ArgsData;

export interface ArgsOptions {
  maxFirst?: number;
}

/** func, pagination and sorting */
export class Args {
  static dataKeys: (keyof ArgsData)[]
    = ['func', 'first', 'offset', 'after', 'orderasc', 'orderdesc'];

  private options: ArgsOptions = {};

  /** `args` can contain options too */
  constructor(
    private args: ArgsData & Partial<ArgsOptions> = {},
    options?: ArgsOptions
  ) {
    if (options) this.options = options;
    else this.options = Object.assign({}, R.omit(Args.dataKeys, args));

    this.args = Args.dataKeys.reduce((r, k) => {
      r[k] = this.parse(k, args[k]);
      return r;
    }, {} as ArgsData);
  }

  parse<K extends keyof ArgsData>(key: K, val: any) {
    if (!val) return val;
    if (['first', 'offset'].includes(key))
      val = parseInt(val as any) || 0;
    if (key === 'first' && this.options.maxFirst)
      return Math.min(val as number, this.options.maxFirst);
    // TODO: parse/validate other fields too
    return val;
  }

  setArg<K extends keyof ArgsData>(key: K, val: ArgsData[K]) {
    this.args[key] = this.parse(key, val);
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
