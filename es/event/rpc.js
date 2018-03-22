import { uintToInt } from '../bin';
import { RpcApiError } from '../error';
import Logger from 'mtproto-logger';
var log = Logger`event, rpc`;

export var onRpcError = rpcError => {
  var errorMessage = rpcError.error_message || '';
  var matches = errorMessage.match(/^([A-Z_0-9]+\b)(: (.+))?/) || [];
  var errorCode = uintToInt(rpcError.error_code || 0);
  var code = !errorCode || errorCode <= 0 ? 500 : errorCode;
  matches[1] || 'UNKNOWN';

  var description = matches[3] || `CODE#${code} ${errorMessage}`;
  return new RpcApiError(code, description);
};

var migrateRegexp = /^(PHONE_MIGRATE_|NETWORK_MIGRATE_|USER_MIGRATE_)(\d+)/;
var fileMigrateRegexp = /^(FILE_MIGRATE_)(\d+)/;

export var isMigrateError = err => migrateRegexp.test(err.message);
export var isFileMigrateError = err => fileMigrateRegexp.test(err.message);

export var getMigrateDc = (err, regExp = migrateRegexp) => {
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

export var getFileMigrateDc = err => getMigrateDc(err, fileMigrateRegexp);
//# sourceMappingURL=rpc.js.map