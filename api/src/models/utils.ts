import * as R from 'ramda';
import {
  ArgsData,
  ArgsOptions,
  Args,
  Projection,
  Query,
  Edge,
} from '../dgraph';

export interface QueryOptions extends ArgsData {
  queryName?: string;
}

export const withArgs = R.curry((
  opts: ArgsOptions,
  args: ArgsData,
  obj: Query | Edge
) => {
  return obj.withArgs(new Args(args, opts))
})({ maxFirst: 20 });

export const defaultQueryOptions = {
  queryName: 'q',
};

export function query(
  rootType: string,
  opts: Partial<QueryOptions> = defaultQueryOptions
) {
  opts = { ...defaultQueryOptions, ...opts };
  return new Query(rootType, opts.queryName)
    .apply(withArgs(opts));
}
