function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { Deserialization } from '../../tl';
import { bytesCmp, bytesToHex, convertToUint8Array, bytesToArrayBuffer, bytesFromArrayBuffer } from '../../bin';
import CryptoWorker from '../../crypto';
import getMsgKeyIv from './msg-key';
import { readLong } from '../../tl/reader';

export function readResponse({ response, reader, authKeyStored }) {
  var authKeyID = reader.fetchIntBytes(64, 'auth_key_id');
  if (!bytesCmp(authKeyID, authKeyStored)) {
    //TODO Remove auth keys from logs
    throw new Error(`[MT] Invalid server auth_key_id: ${authKeyID.toString()} ${bytesToHex(authKeyID)}, authKeyStored: ${authKeyStored.toString()} ${bytesToHex(authKeyStored)}`);
  }
  var msgKey = reader.fetchIntBytes(128, 'msg_key');
  var encryptedData = reader.fetchRawBytes(response.byteLength - reader.getOffset(), 'encrypted_data');
  return {
    msgKey,
    encryptedData
  };
}

export var getDataWithPad = (() => {
  var _ref = _asyncToGenerator(function* ({ authKey, msgKey, encryptedData }) {
    var [aesKey, aesIv] = yield getMsgKeyIv(authKey, msgKey, false);
    var dataWithPadding = yield CryptoWorker.aesDecrypt(encryptedData, aesKey, aesIv);
    return dataWithPadding;
  });

  return function getDataWithPad(_x) {
    return _ref.apply(this, arguments);
  };
})();

export function readHash({ reader, currentSession, prevSession, dataWithPadding, uid }) {
  reader.fetchIntBytes(64, 'salt');
  var sessionID = reader.fetchIntBytes(64, 'session_id');
  var messageID = readLong(reader.typeBuffer, 'message_id');

  var isInvalidSession = !bytesCmp(sessionID, currentSession) && (!prevSession
  //eslint-disable-next-line
  || !bytesCmp(sessionID, prevSession));
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

  var buffer = bytesToArrayBuffer(messageBody);

  offset = reader.getOffset();
  var paddingLength = totalLength - offset;
  if (paddingLength < 0 || paddingLength > 15) throw new Error(`[MT] Invalid padding length: ${paddingLength}`);
  var hashData = convertToUint8Array(dataWithPadding).subarray(0, offset);

  return {
    hashData,
    seqNo,
    messageID,
    sessionID,
    buffer
  };
}

export var parsedResponse = (() => {
  var _ref2 = _asyncToGenerator(function* ({ hashData, msgKey, reader }) {
    var dataHash = yield CryptoWorker.sha1Hash(hashData);

    if (!bytesCmp(msgKey, bytesFromArrayBuffer(dataHash).slice(-16))) {
      console.warn(msgKey, bytesFromArrayBuffer(dataHash));
      throw new Error('[MT] server msgKey mismatch');
    }
    var response = reader.fetchObject('', 'INPUT');

    return response;
  });

  return function parsedResponse(_x2) {
    return _ref2.apply(this, arguments);
  };
})();
//# sourceMappingURL=parse-response.js.map