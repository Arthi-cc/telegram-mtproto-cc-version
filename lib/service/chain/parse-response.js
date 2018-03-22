'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsedResponse = exports.getDataWithPad = undefined;

var getDataWithPad = exports.getDataWithPad = (() => {
  var _ref = _asyncToGenerator(function* ({ authKey, msgKey, encryptedData }) {
    var [aesKey, aesIv] = yield (0, _msgKey2.default)(authKey, msgKey, false);
    var dataWithPadding = yield _crypto2.default.aesDecrypt(encryptedData, aesKey, aesIv);
    return dataWithPadding;
  });

  return function getDataWithPad(_x) {
    return _ref.apply(this, arguments);
  };
})();

var parsedResponse = exports.parsedResponse = (() => {
  var _ref2 = _asyncToGenerator(function* ({ hashData, msgKey, reader }) {
    var dataHash = yield _crypto2.default.sha1Hash(hashData);

    if (!(0, _bin.bytesCmp)(msgKey, (0, _bin.bytesFromArrayBuffer)(dataHash).slice(-16))) {
      console.warn(msgKey, (0, _bin.bytesFromArrayBuffer)(dataHash));
      throw new Error('[MT] server msgKey mismatch');
    }
    var response = reader.fetchObject('', 'INPUT');

    return response;
  });

  return function parsedResponse(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.readResponse = readResponse;
exports.readHash = readHash;

var _tl = require('../../tl');

var _bin = require('../../bin');

var _crypto = require('../../crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _msgKey = require('./msg-key');

var _msgKey2 = _interopRequireDefault(_msgKey);

var _reader = require('../../tl/reader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function readResponse({ response, reader, authKeyStored }) {
  var authKeyID = reader.fetchIntBytes(64, 'auth_key_id');
  if (!(0, _bin.bytesCmp)(authKeyID, authKeyStored)) {
    //TODO Remove auth keys from logs
    throw new Error(`[MT] Invalid server auth_key_id: ${authKeyID.toString()} ${(0, _bin.bytesToHex)(authKeyID)}, authKeyStored: ${authKeyStored.toString()} ${(0, _bin.bytesToHex)(authKeyStored)}`);
  }
  var msgKey = reader.fetchIntBytes(128, 'msg_key');
  var encryptedData = reader.fetchRawBytes(response.byteLength - reader.getOffset(), 'encrypted_data');
  return {
    msgKey,
    encryptedData
  };
}

function readHash({ reader, currentSession, prevSession, dataWithPadding, uid }) {
  reader.fetchIntBytes(64, 'salt');
  var sessionID = reader.fetchIntBytes(64, 'session_id');
  var messageID = (0, _reader.readLong)(reader.typeBuffer, 'message_id');

  var isInvalidSession = !(0, _bin.bytesCmp)(sessionID, currentSession) && (!prevSession
  //eslint-disable-next-line
  || !(0, _bin.bytesCmp)(sessionID, prevSession));
  if (isInvalidSession) {
    console.warn('Invalid server session', sessionID, currentSession, prevSession);
    // throw new Error(`[MT] Invalid server session_id: ${ bytesToHex(sessionID) } ${sessionID.toString()}  ${bytesToHex(currentSession)} ${currentSession.toString()}`)
  }

  var seqNo = reader.fetchInt('seq_no');

  var offset = reader.getOffset();
  var totalLength = dataWithPadding.byteLength;

  var messageBodyLength = reader.fetchInt('message_data[length]');
  if (messageBodyLength % 4 || messageBodyLength > totalLength - offset) {
    throw new Error(`[MT] Invalid body length: ${messageBodyLength}`);
  }
  var messageBody = reader.fetchRawBytes(messageBodyLength, 'message_data');

  var buffer = (0, _bin.bytesToArrayBuffer)(messageBody);

  offset = reader.getOffset();
  var paddingLength = totalLength - offset;
  if (paddingLength < 0 || paddingLength > 15) throw new Error(`[MT] Invalid padding length: ${paddingLength}`);
  var hashData = (0, _bin.convertToUint8Array)(dataWithPadding).subarray(0, offset);

  return {
    hashData,
    seqNo,
    messageID,
    sessionID,
    buffer
  };
}
//# sourceMappingURL=parse-response.js.map