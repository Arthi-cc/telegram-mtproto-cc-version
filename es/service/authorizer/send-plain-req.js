import { reject, Fluture, of } from 'fluture';

import { send } from '../../http';
import { ErrorBadResponse, ErrorNotFound } from '../../error';
import { generateID } from '../time-manager';
import { readLong, readInt } from '../../tl/reader';
import { writeLong, writeLongP, writeInt } from '../../tl/writer';
import Config from '../../config-provider';
import { Serialization, Deserialization } from '../../tl';

export default function sendPlain(uid, url) {
  var sendData = send(url);
  var onRes = plainRequest(uid, url);

  return buffer => onlySendPlainReq(uid, buffer).chain(sendData).mapRej(onlySendPlainErr).chain(onRes);
}

var plainRequest = (uid, url) => req => onlySendPlain(uid, url, req);

function onlySendPlainReq(uid, requestBuffer) {
  var requestLength = requestBuffer.byteLength,
      requestArray = new Int32Array(requestBuffer);

  var header = new Serialization({}, uid);
  var headBox = header.writer;

  writeLongP(headBox, 0, 0, 'auth_key_id'); // Auth key
  writeLong(headBox, generateID(uid), 'msg_id'); // Msg_id
  writeInt(headBox, requestLength, 'request_length');

  var headerBuffer = headBox.getBuffer(),
      headerArray = new Int32Array(headerBuffer);
  var headerLength = headerBuffer.byteLength;

  var resultBuffer = new ArrayBuffer(headerLength + requestLength),
      resultArray = new Int32Array(resultBuffer);

  resultArray.set(headerArray);
  resultArray.set(requestArray, headerArray.length);

  return of(resultArray);
}

function onlySendPlainErr(err) {
  if (err && err.response && err.response.status === 404) return new ErrorNotFound(err);
  return err;
}

function onlySendPlain(uid, url, req /*::: **/
) {
  if (!req.data || !req.data.byteLength) {
    var error = new ErrorBadResponse(url);
    Config.emit(uid)('response-raw', error);
    return reject(error);
  }

  var deserializer = void 0;
  try {
    deserializer = new Deserialization(req.data, { mtproto: true }, uid);
    var ctx = deserializer.typeBuffer;
    readLong(ctx, 'auth_key_id');
    readLong(ctx, 'msg_id');
    readInt(ctx, 'msg_len');
  } catch (e) {
    var _error = new ErrorBadResponse(url, e);
    Config.emit(uid)('response-raw', _error);
    return reject(_error);
  }
  Config.emit(uid)('response-raw', {
    data: req.data,
    status: req.status,
    statusText: req.statusText
  });
  return of(deserializer);
}
//# sourceMappingURL=send-plain-req.js.map