import { append, toPairs, chain, allPass, pipe, view, lensPath } from 'ramda';

var viewPath = pipe(lensPath, view);

var makeValidator = (value, currentPath) => pipe(viewPath(currentPath), e => e === value);

var selectCase = (value, fieldPath) => typeof value === 'object' ? processSpec(value, fieldPath) : makeValidator(value, fieldPath);

//$off
var processPair = fieldPath => ([key, value]) => selectCase(value, append(key, fieldPath));

var processSpec = (spec, fieldPath) => chain(processPair(fieldPath), toPairs(spec));

/**
 * Validate object by given pattern
 *
 * @param {Object} spec
 * @returns {(x: any) => boolean}
 */
export default function guard(spec) {
  //$off
  return allPass(processSpec(spec, []));
}
//# sourceMappingURL=match-spec.js.map