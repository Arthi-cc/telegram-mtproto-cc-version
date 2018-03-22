'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onNewTask = undefined;

var _most = require('most');

var _fluture = require('fluture');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

var _action = require('../action');

var _netMessage = require('../../service/networker/net-message');

var _networker = require('../../service/networker');

var _networker2 = _interopRequireDefault(_networker);

var _request = require('../../service/main/request');

var _request2 = _interopRequireDefault(_request);

var _encryptedMessage = require('../../service/chain/encrypted-message');

var _configProvider = require('../../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

var _tl = require('../../tl');

var _http = require('../../http');

var _jsonError = require('../../util/json-error');

var _jsonError2 = _interopRequireDefault(_jsonError);

var _requestCache = require('../../util/request-cache');

var _requestCache2 = _interopRequireDefault(_requestCache);

var _query = require('../query');

var _monadT = require('../../util/monad-t');

var _newtype = require('../../newtype.h');

var _invoke = require('../../service/invoke');

var _portal = require('../portal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var log = _mtprotoLogger2.default`net-request`;

function makeApiBytes(_ref) {
  var { uid, dc, message, thread } = _ref,
      rest = _objectWithoutProperties(_ref, ['uid', 'dc', 'message', 'thread']);

  var keys = (0, _query.queryKeys)(uid, dc);

  var session = _configProvider2.default.session.get(uid, dc);
  if (!_monadT.MaybeT.isJust(keys)) throw new TypeError(`No session! ${String(keys)}`);
  var { auth, salt, authID } = _monadT.MaybeT.unsafeGet(keys);

  var bytes = (0, _encryptedMessage.apiMessage)({
    ctx: new _tl.Serialization({ startMaxLength: message.body.length + 64 }, uid).writer,
    serverSalt: salt,
    sessionID: session,
    message
  });
  return (0, _encryptedMessage.encryptApiBytes)(bytes, auth).map(data => Object.assign({}, rest, data, {
    uid, dc, message, thread,
    auth, salt, session, authID
  }));
}

var requestCache = (0, _requestCache2.default)(({ requestID }) => requestID, 80);

var sendCache = (0, _requestCache2.default)(data => data.message.msg_id, 80);

var onNewTask = exports.onNewTask = action => action.thru(_action.API.NEXT.stream).map(e => e.payload).map(({ uid }) => (0, _portal.getState)().client[uid]).map(e => e.progress.current[0]).filter(e => !!e).filter(requestCache)
// .map(e => e.payload)
// .chain(e => of(e).delay(200))
// .delay(100)
// .thru(e => netStatusGuard(netStatuses.halt, homeStatus, e))
// .thru(guestStatus)
.tap(val => {}).map(i => (0, _invoke.makeAuthRequest)(i).promise())

// .tap(val => {
//   Array.isArray(val)
//     ? val.map(v => v.netReq.invoke())
//     : val.netReq.invoke()
// })
.filter(() => false);

function encryption(ctx) {
  var {
    bytes,
    msgKey,
    authID,
    uid,
    url,
    dc,
    thread,
    message,
    noResponseMsgs
  } = ctx,
      rest = _objectWithoutProperties(ctx, ['bytes', 'msgKey', 'authID', 'uid', 'url', 'dc', 'thread', 'message', 'noResponseMsgs']);
  var request = new _tl.Serialization({
    startMaxLength: bytes.byteLength + 256
  }, uid).writer;
  var mtBytes = (0, _encryptedMessage.mtMessage)({
    ctx: request,
    authKeyID: authID,
    msgKey,
    encryptedBytes: bytes
  });

  return (0, _http.send)(url, mtBytes).map(function propsToResult(result) {
    return {
      result,
      message,
      dc,
      uid,
      thread,
      noResponseMsgs
    };
  });
}

var netRequest = action => action.thru(_action.NET.SEND.stream).map(e => e.payload).map(data => Object.assign({}, data, { dc: data.thread.dcID })).map(data => Object.assign({}, data, { uid: data.thread.uid })).map(data => Object.assign({}, data, { url: _configProvider2.default.dcMap(data.uid, data.dc) })).filter(({ dc, uid }) => !_configProvider2.default.halt.get(uid, dc)).filter(sendCache).filter(({ dc, uid }) => (0, _query.queryKeys)(uid, dc).fold(() => false, () => true))
// .filter(({ message }) => getState()
//   .client[message.uid]
//   .lastMessages
//   .indexOf(message.msg_id) === -1)
.map(data => requestItself(data).promise()).filter(() => false);
// .thru(awaitPromises)
// .tap(data => console.warn('RECIEVE RESP', data))
// .map(NET.RECEIVE_RESPONSE)
// .recoverWith(err => of(NET.NETWORK_ERROR(jsonError(err))))

var requestItself = data => (0, _fluture.after)(100, data).chain(makeApiBytes).chain(encryption).map(res => (0, _portal.dispatch)(_action.NET.RECEIVE_RESPONSE(res), data.uid)).chainRej(err => (0, _fluture.of)((0, _portal.dispatch)(_action.NET.NETWORK_ERROR((0, _jsonError2.default)(err)), data.uid)));

exports.default = netRequest;
//# sourceMappingURL=net-request.js.map