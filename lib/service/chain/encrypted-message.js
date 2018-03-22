'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encryptApiBytes = undefined;
exports.apiMessage = apiMessage;
exports.mtMessage = mtMessage;

var _fluture = require('fluture');

var _crypto = require('../../crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _msgKey = require('./msg-key');

var _msgKey2 = _interopRequireDefault(_msgKey);

var _writer = require('../../tl/writer');

var _netMessage = require('../networker/net-message');

var _typeBuffer = require('../../tl/type-buffer');

var _bin = require('../../bin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Logger from 'mtproto-logger'

// const log = Logger`encrypted message`


function apiMessage({ ctx, serverSalt, sessionID, message }) {
  (0, _writer.writeIntBytes)(ctx, serverSalt, 64);
  (0, _writer.writeIntBytes)(ctx, sessionID, 64);
  (0, _writer.writeLong)(ctx, message.msg_id, 'message_id');
  (0, _writer.writeInt)(ctx, message.seq_no, 'seq_no');

  (0, _writer.writeInt)(ctx, message.body.length, 'message_data_length');
  (0, _writer.writeIntBytes)(ctx, message.body, false);

  var apiBytes = ctx.getBuffer();

  return apiBytes;
}

var sha1HashPlain = bytes => _crypto2.default.sha1Hash(bytes);
var msgKeyFromHash = hash => new Uint8Array(hash).subarray(4, 20);
var aesFromSha1 = (authKey, msgKey) => (0, _msgKey2.default)(authKey, msgKey, true);
var encryptAES = (bytes, [aesKey, aesIv]) => _crypto2.default.aesEncrypt(bytes, aesKey, aesIv);

var makeMsgKey = bytes => (0, _fluture.encaseP)(sha1HashPlain, bytes).map(msgKeyFromHash);

var makeAesKeys = (authKey, msgKey) => (0, _fluture.encaseP2)(aesFromSha1, authKey, msgKey);

var makeEncryptedBytes = (bytes, pair) => (0, _fluture.encaseP2)(encryptAES, bytes, pair);

var aesEncrypt = (bytes, authKey, msgKey) => makeAesKeys(authKey, msgKey).chain(aes => makeEncryptedBytes(bytes, aes)).map(result => ({ bytes: result, msgKey }));

var encryptApiBytes = exports.encryptApiBytes = (bytes, authKey) => makeMsgKey(bytes).chain(msgKey => aesEncrypt(bytes, (0, _bin.convertToUint8Array)(authKey), msgKey));

function mtMessage({ ctx, authKeyID, msgKey, encryptedBytes }) {
  (0, _writer.writeIntBytes)(ctx, authKeyID, 64);
  (0, _writer.writeIntBytes)(ctx, msgKey, 128);
  (0, _writer.writeIntBytes)(ctx, encryptedBytes, false);

  var mtBytes = ctx.getArray();

  return mtBytes;
}
//# sourceMappingURL=encrypted-message.js.map