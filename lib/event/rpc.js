'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileMigrateDc = exports.getMigrateDc = exports.isFileMigrateError = exports.isMigrateError = exports.onRpcError = undefined;

var _bin = require('../bin');

var _error = require('../error');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`event, rpc`;

var onRpcError = exports.onRpcError = rpcError => {
  var errorMessage = rpcError.error_message || '';
  var matches = errorMessage.match(/^([A-Z_0-9]+\b)(: (.+))?/) || [];
  var errorCode = (0, _bin.uintToInt)(rpcError.error_code || 0);
  var code = !errorCode || errorCode <= 0 ? 500 : errorCode;
  matches[1] || 'UNKNOWN';

  var description = matches[3] || `CODE#${code} ${errorMessage}`;
  return new _error.RpcApiError(code, description);
};

var migrateRegexp = /^(PHONE_MIGRATE_|NETWORK_MIGRATE_|USER_MIGRATE_)(\d+)/;
var fileMigrateRegexp = /^(FILE_MIGRATE_)(\d+)/;

var isMigrateError = exports.isMigrateError = err => migrateRegexp.test(err.message);
var isFileMigrateError = exports.isFileMigrateError = err => fileMigrateRegexp.test(err.message);

var getMigrateDc = exports.getMigrateDc = (err, regExp = migrateRegexp) => {
  var matched = err.message.match(regExp);
  if (!matched || matched.length < 2) {
    log('warning')('no matched error type', err.message);
    return null;
  }
  var [,, newDcID] = matched;
  if (!isFinite(newDcID)) {
    log('warning', 'migrated error')('invalid dc', newDcID);
    return null;
  }
  var newDc = parseInt(newDcID, 10);
  return newDc;
};

var getFileMigrateDc = exports.getFileMigrateDc = err => getMigrateDc(err, fileMigrateRegexp);
//# sourceMappingURL=rpc.js.map