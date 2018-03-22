'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MTProto = exports.MtpTimeManager = exports.plugins = exports.setLogger = exports.CryptoWorker = undefined;

var _crypto = require('./crypto');

Object.defineProperty(exports, 'CryptoWorker', {
  enumerable: true,
  get: function () {
    return _crypto.CryptoWorker;
  }
});

var _mtprotoLogger = require('mtproto-logger');

Object.defineProperty(exports, 'setLogger', {
  enumerable: true,
  get: function () {
    return _mtprotoLogger.setLogger;
  }
});

require('./bluebird-config');

var _wrap = require('./service/main/wrap');

var _wrap2 = _interopRequireDefault(_wrap);

require('./state/core');

var _plugins = require('./plugins');

var plugins = _interopRequireWildcard(_plugins);

var _timeManager = require('./service/time-manager');

var MtpTimeManager = _interopRequireWildcard(_timeManager);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.plugins = plugins;
exports.MtpTimeManager = MtpTimeManager;
exports.MTProto = _wrap2.default;
exports.default = _wrap2.default;
//# sourceMappingURL=index.js.map