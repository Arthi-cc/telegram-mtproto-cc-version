import { encaseP, encaseP2, Fluture } from 'fluture';

import CryptoWorker from '../../crypto';
import getMsgKeyIv from './msg-key';
import { writeInt, writeIntBytes, writeLong } from '../../tl/writer';

import { NetMessage } from '../networker/net-message';
import { TypeWriter } from '../../tl/type-buffer';
import { convertToUint8Array } from '../../bin';
// import Logger from 'mtproto-logger'

// const log = Logger`encrypted message`


export function apiMessage({ ctx, serverSalt, sessionID, message }) {
  writeIntBytes(ctx, serverSalt, 64);
  writeIntBytes(ctx, sessionID, 64);
  writeLong(ctx, message.msg_id, 'message_id');
  writeInt(ctx, message.seq_no, 'seq_no');

  writeInt(ctx, message.body.length, 'message_data_length');
  writeIntBytes(ctx, message.body, false);

  var apiBytes = ctx.getBuffer();

  return apiBytes;
}

var sha1HashPlain = bytes => CryptoWorker.sha1Hash(bytes);
var msgKeyFromHash = hash => new Uint8Array(hash).subarray(4, 20);
var aesFromSha1 = (authKey, msgKey) => getMsgKeyIv(authKey, msgKey, true);
var encryptAES = (bytes, [aesKey, aesIv]) => CryptoWorker.aesEncrypt(bytes, aesKey, aesIv);

var makeMsgKey = bytes => encaseP(sha1HashPlain, bytes).map(msgKeyFromHash);

var makeAesKeys = (authKey, msgKey) => encaseP2(aesFromSha1, authKey, msgKey);

var makeEncryptedBytes = (bytes, pair) => encaseP2(encryptAES, bytes, pair);

var aesEncrypt = (bytes, authKey, msgKey) => makeAesKeys(authKey, msgKey).chain(aes => makeEncryptedBytes(bytes, aes)).map(result => ({ bytes: result, msgKey }));

export var encryptApiBytes = (bytes, authKey) => makeMsgKey(bytes).chain(msgKey => aesEncrypt(bytes, convertToUint8Array(authKey), msgKey));

export function mtMessage({ ctx, authKeyID, msgKey, encryptedBytes }) {
  writeIntBytes(ctx, authKeyID, 64);
  writeIntBytes(ctx, msgKey, 128);
  writeIntBytes(ctx, encryptedBytes, false);

  var mtBytes = ctx.getArray();

  return mtBytes;
}
//# sourceMappingURL=encrypted-message.js.map