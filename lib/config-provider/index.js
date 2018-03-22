'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerInstance = exports.getConfig = undefined;

var _provider = require('./provider');

Object.defineProperty(exports, 'getConfig', {
  enumerable: true,
  get: function () {
    return _provider.getConfig;
  }
});
Object.defineProperty(exports, 'registerInstance', {
  enumerable: true,
  get: function () {
    return _provider.registerInstance;
  }
});

var _facade = require('./facade');

var _facade2 = _interopRequireDefault(_facade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _facade2.default;
//# sourceMappingURL=index.js.map