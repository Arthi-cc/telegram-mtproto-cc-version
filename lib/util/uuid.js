'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = newUuid;

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _newtype = require('../newtype.h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function newUuid() {
  return (/*:: toUID( */(0, _v2.default)().slice(0, 8)
  ); /*:: ) */
}
//# sourceMappingURL=uuid.js.map