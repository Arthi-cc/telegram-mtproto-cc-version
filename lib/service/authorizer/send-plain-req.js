'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sendPlain;

var _fluture = require('fluture');

var _http = require('../../http');

var _error2 = require('../../error');

var _timeManager = require('../time-manager');

var _reader = require('../../tl/reader');

var _writer = require('../../tl/writer');

var _configProvider = require('../../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

var _tl = require('../../tl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendPlain(uid, url) {
  var sendData = (0, _http.send)(url);
  var onRes = plainRequest(uid, url);

  return buffer => onlySendPlainReq(uid, buffer).chain(sendData).mapRej(onlySendPlainErr).chain(onRes);
}

var plainRequest = (uid, url) => req => onlySendPlain(uid, url, req);

function onlySendPlainReq(uid, requestBuffer) {
  var requestLength = requestBuffer.byteLength,
      requestArray = new Int32Array(requestBuffer);

  var header = new _tl.Serialization({}, uid);
  var headBox = header.writer;

  (0, _writer.writeLongP)(headBox, 0, 0, 'auth_key_id'); // Auth key
  (0, _writer.writeLong)(headBox, (0, _timeManager.generateID)(uid), 'msg_id'); // Msg_id
  (0, _writer.writeInt)(headBox, requestLength, 'request_length');

  var headerBuffer = headBox.getBuffer(),
      headerArray = new Int32Array(headerBuffer);
  var headerLength = headerBuffer.byteLength;

  var resultBuffer = new ArrayBuffer(headerLength + requestLength),
      resultArray = new Int32Array(resultBuffer);

  resultArray.set(headerArray);
  resultArray.set(requestArray, headerArray.length);

  return (0, _fluture.of)(resultArray);
}

function onlySendPlainErr(err) {
  if (err && err.response && err.response.status === 404) return new _error2.ErrorNotFound(err);
  return err;
}

function onlySendPlain(uid, url, req /*::: **/
) {
  if (!req.data || !req.data.byteLength) {
    var error = new _error2.ErrorBadResponse(url);
    _configProvider2.default.emit(uid)('response-raw', error);
    return (0, _fluture.reject)(error);
  }

  var deserializer = void 0;
  try {
    deserializer = new _tl.Deserialization(req.data, { mtproto: true }, uid);
    var ctx = deserializer.typeBuffer;
    (0, _reader.readLong)(ctx, 'auth_key_id');
    (0, _reader.readLong)(ctx, 'msg_id');
    (0, _reader.readInt)(ctx, 'msg_len');
  } catch (e) {
    var _error = new _error2.ErrorBadResponse(url, e);
    _configProvider2.default.emit(uid)('response-raw', _error);
    return (0, _fluture.reject)(_error);
  }
  _configProvider2.default.emit(uid)('response-raw', {
    data: req.data,
    status: req.status,
    statusText: req.statusText
  });
  return (0, _fluture.of)(deserializer);
}
//# sourceMappingURL=send-plain-req.js.map