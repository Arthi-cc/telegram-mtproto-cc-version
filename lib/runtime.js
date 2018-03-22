'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isWebpack = exports.isNode = undefined;

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.isNode = _detectNode2.default;

/*::
declare var __webpack_require__: mixed;
*/

var isWebpack = exports.isWebpack = typeof __webpack_require__ !== 'undefined';
//# sourceMappingURL=runtime.js.map