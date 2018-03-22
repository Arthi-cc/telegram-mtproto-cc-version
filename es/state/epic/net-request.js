function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import { Stream, of, awaitPromises } from 'most';
import { encaseP, after, of as ofF } from 'fluture';

import Logger from 'mtproto-logger';
var log = Logger`net-request`;

import { API, NET } from '../action';
import { NetMessage } from '../../service/networker/net-message';
import NetworkerThread from '../../service/networker';
import ApiRequest from '../../service/main/request';
import { apiMessage, mtMessage, encryptApiBytes } from '../../service/chain/encrypted-message';
import Config from '../../config-provider';
import { Serialization } from '../../tl';
import { send } from '../../http';
import jsonError from '../../util/json-error';
import TTLCache from '../../util/request-cache';
import { queryKeys } from '../query';
import { MaybeT } from '../../util/monad-t';
import { toUID } from '../../newtype.h';
import { makeAuthRequest } from '../../service/invoke';
import { getState, dispatch } from '../portal';

function makeApiBytes(_ref) {
  var { uid, dc, message, thread } = _ref,
      rest = _objectWithoutProperties(_ref, ['uid', 'dc', 'message', 'thread']);

  var keys = queryKeys(uid, dc);

  var session = Config.session.get(uid, dc);
  if (!MaybeT.isJust(keys)) throw new TypeError(`No session! ${String(keys)}`);
  var { auth, salt, authID } = MaybeT.unsafeGet(keys);

  var bytes = apiMessage({
    ctx: new Serialization({ startMaxLength: message.body.length + 64 }, uid).writer,
    serverSalt: salt,
    sessionID: session,
    message
  });
  return encryptApiBytes(bytes, auth).map(data => Object.assign({}, rest, data, {
    uid, dc, message, thread,
    auth, salt, session, authID
  }));
}

var requestCache = TTLCache(({ requestID }) => requestID, 80);

var sendCache = TTLCache(data => data.message.msg_id, 80);

export var onNewTask = action => action.thru(API.NEXT.stream).map(e => e.payload).map(({ uid }) => getState().client[uid]).map(e => e.progress.current[0]).filter(e => !!e).filter(requestCache)
// .map(e => e.payload)
// .chain(e => of(e).delay(200))
// .delay(100)
// .thru(e => netStatusGuard(netStatuses.halt, homeStatus, e))
// .thru(guestStatus)
.tap(val => {}).map(i => makeAuthRequest(i).promise())

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
  var request = new Serialization({
    startMaxLength: bytes.byteLength + 256
  }, uid).writer;
  var mtBytes = mtMessage({
    ctx: request,
    authKeyID: authID,
    msgKey,
    encryptedBytes: bytes
  });

  return send(url, mtBytes).map(function propsToResult(result) {
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

var netRequest = action => action.thru(NET.SEND.stream).map(e => e.payload).map(data => Object.assign({}, data, { dc: data.thread.dcID })).map(data => Object.assign({}, data, { uid: data.thread.uid })).map(data => Object.assign({}, data, { url: Config.dcMap(data.uid, data.dc) })).filter(({ dc, uid }) => !Config.halt.get(uid, dc)).filter(sendCache).filter(({ dc, uid }) => queryKeys(uid, dc).fold(() => false, () => true))
// .filter(({ message }) => getState()
//   .client[message.uid]
//   .lastMessages
//   .indexOf(message.msg_id) === -1)
.map(data => requestItself(data).promise()).filter(() => false);
// .thru(awaitPromises)
// .tap(data => console.warn('RECIEVE RESP', data))
// .map(NET.RECEIVE_RESPONSE)
// .recoverWith(err => of(NET.NETWORK_ERROR(jsonError(err))))

var requestItself = data => after(100, data).chain(makeApiBytes).chain(encryption).map(res => dispatch(NET.RECEIVE_RESPONSE(res), data.uid)).chainRej(err => ofF(dispatch(NET.NETWORK_ERROR(jsonError(err)), data.uid)));

export default netRequest;
//# sourceMappingURL=net-request.js.map