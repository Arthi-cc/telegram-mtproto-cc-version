'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.receiveResponse = undefined;

var _most = require('most');

var _fluture = require('fluture');

var _ramda = require('ramda');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

var _action = require('../action');

var _task = require('../../task');

var _jsonError = require('../../util/json-error');

var _jsonError2 = _interopRequireDefault(_jsonError);

var _query = require('../query');

var _networker = require('../../service/networker');

var _networker2 = _interopRequireDefault(_networker);

var _portal = require('../portal');

var _timeManager = require('../../service/time-manager');

var _netMessage = require('../../service/networker/net-message');

var _configProvider = require('../../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`epic-task`;

function flatPairs(data) {
  return [].concat(...(0, _ramda.toPairs)(data).map(([n, list]) => list));
}

var epicHandler = (actionCreator, future) => action => action.thru(actionCreator.stream).map(e => e.payload).map(payload => future(payload).chainRej(err => (0, _fluture.of)((0, _portal.dispatch)(_action.NET.NETWORK_ERROR((0, _jsonError2.default)(err)), payload.uid))).promise()).filter(() => false).recoverWith(err => (0, _most.of)(_action.NET.NETWORK_ERROR((0, _jsonError2.default)(err))));

var receiveResponse = exports.receiveResponse = epicHandler(_action.NET.RECEIVE_RESPONSE, payload => (0, _task.decrypt)(payload).map(_task.normalize).map(data => {
  var {
    normalized,
    summary,
    dc,
    uid,
    // salt: saltKey,
    // auth: authKey,
    thread
  } = data;
  var {
    processAck,
    ack,
    reqResend
  } = summary;
  // const { salt, auth } = summary
  // const saltPairs = toPairs(salt)
  // const authPairs = toPairs(auth)
  // for (const [dc, value] of saltPairs) {
  //   if (!Array.isArray(value)) {
  //     await Config.storage.remove(uid, `dc${dc}_server_salt`)
  //   } else {
  //     await Config.storage.set(uid, `dc${dc}_server_salt`, value)
  //   }
  // }
  // for (const [dc, value] of authPairs) {
  //   if (!Array.isArray(value)) {
  //     await Config.storage.remove(uid, `dc${dc}_auth_key`)
  //   } else {
  //     await Config.storage.set(uid, `dc${dc}_auth_key`, value)
  //   }
  // }

  for (var _iterator = flatPairs(processAck), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var id = _ref;

    processMessageAck(uid, dc, id);
  }
  for (var _iterator2 = flatPairs(ack), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    var _id = _ref2;

    ackMessage(uid, dc, _id, thread);
  }
  for (var _iterator3 = flatPairs(reqResend), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
    var _ref3;

    if (_isArray3) {
      if (_i3 >= _iterator3.length) break;
      _ref3 = _iterator3[_i3++];
    } else {
      _i3 = _iterator3.next();
      if (_i3.done) break;
      _ref3 = _i3.value;
    }

    var _id2 = _ref3;

    pushResend(uid, dc, _id2, thread);
  }
  performResend(uid, dc, thread);

  (0, _portal.dispatch)({
    type: '[01] action carrier',
    payload: {
      normalized, summary
    }
  }, uid);

  return Object.assign({}, data, {
    uid,
    dc,
    normalized
  });
}).map(({ uid, dc, thread, noResponseMsgs, normalized }) => {
  // await thread.requestPerformer(message, noResponseMsgs, result)
  var cache = _configProvider2.default.fastCache.get(uid, dc);
  // thread.toggleOffline(false)
  var sentDel = [];
  for (var _iterator4 = noResponseMsgs, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
    var _ref4;

    if (_isArray4) {
      if (_i4 >= _iterator4.length) break;
      _ref4 = _iterator4[_i4++];
    } else {
      _i4 = _iterator4.next();
      if (_i4.done) break;
      _ref4 = _i4.value;
    }

    var msgID = _ref4;

    if (cache.hasSent(msgID)) {
      var msg = cache.getSent(msgID);
      sentDel.push(msg);
      cache.deleteSent(msg);
      msg.deferred.resolve();
    }
  } // dispatch(NETWORKER_STATE.SENT.DEL(sentDel, thread.dcID))
  thread.checkConnectionPeriod = Math.max(1.1, Math.sqrt(thread.checkConnectionPeriod));
  thread.checkLongPoll();
  var result = normalized.map(obj => Object.assign({}, obj, { uid }));
  (0, _portal.dispatch)(_action.API.TASK.DONE(result), uid);
}));

function processMessageAck(uid, dc, msg) {
  var cache = _configProvider2.default.fastCache.get(uid, dc);
  var sentMessage = cache.getSent(msg);
  if (sentMessage && !sentMessage.acked) {
    //TODO Warning, mutable changes!
    delete sentMessage.body;
    sentMessage.acked = true;
  }
}

function ackMessage(uid, dc, msg, thread) {
  var ackMsgIDs = (0, _query.queryAck)(uid, dc);
  if ((0, _ramda.contains)(msg, ackMsgIDs)) return;
  (0, _portal.dispatch)(_action.NET.ACK_ADD({ dc, ack: [msg] }), uid);
  thread.sheduleRequest(30000);
}

function pushResend(uid, dc, msg, thread) {
  var cache = _configProvider2.default.fastCache.get(uid, dc);
  var value = (0, _timeManager.tsNow)();
  var sentMessage = cache.getSent(msg);
  if (sentMessage instanceof _netMessage.NetContainer) {
    for (var _iterator5 = sentMessage.inner, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
      var _ref5;

      if (_isArray5) {
        if (_i5 >= _iterator5.length) break;
        _ref5 = _iterator5[_i5++];
      } else {
        _i5 = _iterator5.next();
        if (_i5.done) break;
        _ref5 = _i5.value;
      }

      var _msg = _ref5;

      cache.setPending(_msg, value);
    }
  } else {
    cache.setPending(msg, value);
  }
  thread.sheduleRequest(100);
}

function performResend(uid, dc, thread) {
  var cache = _configProvider2.default.fastCache.get(uid, dc);
  if (cache.hasResends()) {
    var resendMsgIDs = [...cache.getResends()];

    var msg = thread.wrapMtpMessage({
      _: 'msg_resend_req',
      msg_ids: resendMsgIDs
    }, { noShedule: true, notContentRelated: true });
    thread.lastResendReq = {
      req_msg_id: msg.msg_id,
      resend_msg_ids: resendMsgIDs
    };
  }
}
//# sourceMappingURL=task.js.map