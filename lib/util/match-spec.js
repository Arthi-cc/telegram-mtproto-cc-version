'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = guard;

var _ramda = require('ramda');

var viewPath = (0, _ramda.pipe)(_ramda.lensPath, _ramda.view);

var makeValidator = (value, currentPath) => (0, _ramda.pipe)(viewPath(currentPath), e => e === value);

var selectCase = (value, fieldPath) => typeof value === 'object' ? processSpec(value, fieldPath) : makeValidator(value, fieldPath);

//$off
var processPair = fieldPath => ([key, value]) => selectCase(value, (0, _ramda.append)(key, fieldPath));

var processSpec = (spec, fieldPath) => (0, _ramda.chain)(processPair(fieldPath), (0, _ramda.toPairs)(spec));

/**
 * Validate object by given pattern
 *
 * @param {Object} spec
 * @returns {(x: any) => boolean}
 */
function guard(spec) {
  //$off
  return (0, _ramda.allPass)(processSpec(spec, []));
}
//# sourceMappingURL=match-spec.js.map