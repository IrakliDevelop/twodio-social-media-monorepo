import R from 'ramda';
import * as jspb from 'google-protobuf';

export function indenter(depth = 0, indentation = '  ') {
  const prefix = indentation.repeat(depth);
  return (str = ''): string => prefix + str;
}

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
