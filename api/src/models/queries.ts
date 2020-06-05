import * as R from 'ramda';
import { QueryOptions, query } from './utils';
import { Projection } from '../dgraph';

export const fetchByID = R.curry(
  (
    rootType: string,
    projection: Projection,
    opts: Partial<QueryOptions>,
    id: string
  ) => query(rootType, opts)
    .func('uid($id)')
    .project(projection)
    .vars({ id: ['string', id] })
);
