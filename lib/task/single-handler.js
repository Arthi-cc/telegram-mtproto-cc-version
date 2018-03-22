'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = singleHandler;

var _ramda = require('ramda');

var _fluture = require('fluture');

var _apropos = require('apropos');

require('./index.h');

var _state = require('../state');

var _describeProtocolError = require('./describe-protocol-error');

var _describeProtocolError2 = _interopRequireDefault(_describeProtocolError);

var _action = require('../state/action');

var _bin = require('../bin');

var _matchSpec = require('../util/match-spec');

var _matchSpec2 = _interopRequireDefault(_matchSpec);

var _warning = require('../util/warning');

var _warning2 = _interopRequireDefault(_warning);

var _secureRandom = require('../service/secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _newtype = require('../newtype.h');

require('../mtp.h.js');

var _query = require('../state/query');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

var _timeManager = require('../service/time-manager');

var _invoke = require('../service/invoke');

var _invoke2 = _interopRequireDefault(_invoke);

var _netMessage = require('../service/networker/net-message');

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var { Just, Nothing } = _apropos.Maybe;
// import { Just } from 'folktale/maybe'


var log = _mtprotoLogger2.default`single-handler`;

//eslint-disable-next-line
var appendRO = (() => {
  /*:: declare function appendReadOnly<T>(
    value: T,
    list: $ReadOnlyArray<T>
  ): $ReadOnlyArray<T> */
  return _ramda.append /*:: , appendReadOnly */;
})();

/*::
interface Writer<+T> {
  set next(x: T): void,
  read(): $ReadOnlyArray<T>,
}
*/
class WriterFacade {
  constructor() {
    this.state = [];
  }

  set next(x) {
    this.state = appendRO(x, this.state);
  }
  read() {
    return this.state;
  }
}

var getFlags = e => e.flags;

var selector = select => (0, _ramda.pipe)((0, _ramda.filter)((0, _ramda.pipe)(getFlags, select, e => !!e)), (0, _ramda.chain)(select));

var noEmpty = (0, _ramda.reject)(_ramda.isEmpty);

function singleHandler(ctx, message) {
  var { flags } = message;
  /*::
  const inners = handleInner(ctx, message)
  const unrels = handleUnrelated(ctx, message)
  */

  var patches = new WriterFacade();
  var result = message;
  if (flags.inner) {
    patches.next = handleInner(ctx, message);
  }
  if (isUnrelatedBody(flags)) {
    var unrel = handleUnrelated(ctx, message);
    if (unrel !== void 0) patches.next = unrel;
  }
  if (flags.error) {
    var { info, patch } = handleError(ctx, message);
    patches.next = patch;

    result = info;
  }

  var collected = patches.read();
  // .map(({ flags, ...e }) => ({
  //   flags: {
  //     ...emptyPatch().flags,
  //     ...flags,
  //   },
  //   ...e
  // }))

  // collected.forEach(e => log`patches`(e))
  var summary = makeSummary(collected);
  //$off
  log`summary`(noEmpty(summary));
  return {
    message: result,
    summary
  };
}

var isUnrelatedBody = (0, _matchSpec2.default)({
  api: false,
  container: false,
  body: true
});

//$off
var processAckChain = selector(e => e.processAck);
//$off
var ackChain = selector(e => e.ack);
//$off
var homeChain = selector(e => e.home);
//$off
var authChain = selector(e => e.authKey);
//$off
var reqResendChain = selector(e => e.reqResend);
//$off
var resendChain = selector(e => e.resend);
//$off
var lastMessagesChain = selector(e => e.lastServerMessages);
//$off
var saltChain = selector(e => e.salt);
//$off
var sessionChain = selector(e => e.session);

function makeSummary(collected) {
  var processAck = processAckChain(collected);
  var ack = ackChain(collected);
  var home = homeChain(collected);
  var auth = authChain(collected);
  var reqResend = reqResendChain(collected);
  var resend = resendChain(collected);
  var lastMessages = lastMessagesChain(collected);
  var salt = saltChain(collected);
  var session = sessionChain(collected);

  return {
    processAck,
    ack,
    home,
    auth,
    reqResend,
    resend,
    lastMessages,
    salt,
    session
  };
}
var patchState = (() => {
  var defArray = (0, _ramda.defaultTo)([]);
  // const lensProcessAck = lensPath(['processAck'])
  // const lensAck = lensPath(['ack'])
  // const lensReqResend = lensPath(['reqResend'])
  // const lensFlags = lensPath(['flags'])
  class PatchState {
    constructor(value) {
      this.value = value;
    }
    ack(data) {
      return new PatchState(Object.assign({}, this.value, {
        ack: [...defArray(this.value.ack), ...data]
      }));
    }
    processAck(data) {
      return new PatchState(Object.assign({}, this.value, {
        processAck: [...defArray(this.value.processAck), ...data]
      }));
    }
    reqResend(data) {
      return new PatchState(Object.assign({}, this.value, {
        reqResend: [...defArray(this.value.reqResend), ...data]
      }));
    }
  }
  return () => new PatchState(emptyPatch());
})();

function handleUnrelated(ctx, message) {
  var { thread, uid, dc } = ctx;
  //$off
  var cast = message;
  var { body } = cast;
  var { id } = cast;

  switch (body._) {
    case 'msgs_ack':
      {
        // body.msg_ids.forEach(thread.processMessageAck)
        var msg_ids = body.msg_ids;

        return patchState().processAck(msg_ids.map(msg => ({ dc, id: msg }))).value;
      }
    case 'msg_detailed_info':
      {
        if (!_configProvider2.default.fastCache.get(uid, dc).hasSent(body.msg_id)) {

          var _id = body.answer_msg_id;
          thread.ackMessage(_id);
          return patchState().ack([{ dc, id: _id }]).value;
        }
        return emptyPatch();
      }
    case 'msg_new_detailed_info':
      {
        var { answer_msg_id: _id2 } = body;
        var state = patchState();
        if ((0, _query.queryAck)(uid, dc).indexOf(_id2) === -1) state = state.reqResend([{ dc, id: _id2 }]);
        return state
        // .ack([{ dc, id }])
        .value;
      }
    case 'msgs_state_info':
      {
        var { answer_msg_id } = body;
        // thread.ackMessage(answer_msg_id)
        var lastResendReq = thread.lastResendReq;
        if (!lastResendReq) break;
        if (lastResendReq.req_msg_id != body.req_msg_id) break;
        // const resendDel = []
        for (var _iterator = lastResendReq.resend_msg_ids, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
          }

          var badMsgID = _ref;

          // resendDel.push(badMsgID)
          _configProvider2.default.fastCache.get(uid, dc).deleteResent(badMsgID);
        }

        return patchState().ack([{ dc, id: answer_msg_id }]).reqResend([{ dc, id }]).value;
        // dispatch(NETWORKER_STATE.RESEND.DEL(resendDel, this.dcID))
      }
    case 'rpc_result':
      {
        return handleRpcResult(ctx, message);
      }
    case 'new_session_created':
      {
        // thread.emit('new-session', {
        //   threadID   : thread.threadID,
        //   networkerDC: message.dc,
        //   messageID  : message.id,
        //   message    : body
        // })
        return handleNewSession(ctx, message);
      }
    case 'bad_server_salt':
      {
        return handleBadSalt(ctx, message);
      }
    case 'bad_msg_notification':
      {
        return handleBadNotify(ctx, message);
      }
    default:
      {
        var { id: _id3 } = message;
        thread.ackMessage(message.id);
        thread.emit('untyped-message', {
          threadID: thread.threadID,
          networkerDC: message.dc,
          message: body,
          messageID: message.id,
          sessionID: _configProvider2.default.session.get(ctx.thread.uid, message.dc),
          result: message
        });
        return patchState().ack([{ dc, id: _id3 }]).value;
      }
  }
}

function handleInner(ctx, message) {
  var { thread } = ctx;
  var { id, dc } = message;
  if (thread.lastServerMessages.indexOf(id) != -1) {
    // console.warn('[MT] Server same messageID: ', messageID)
    // thread.ackMessage(id)
    return patchState().ack([{ dc, id }]).value;
  } else {
    thread.lastServerMessages.push(id);
    if (thread.lastServerMessages.length > 100) {
      thread.lastServerMessages.shift();
    }
    return {
      flags: {
        net: true,
        lastServerMessages: true
      },
      net: [{
        dc,
        lastServerMessages: [id]
      }],
      lastServerMessages: [{ dc, id }]
    };
  }
}

var migrateRegexp = /^(PHONE_MIGRATE_|NETWORK_MIGRATE_|USER_MIGRATE_)(\d+)/;
var fileMigrateRegexp = /^(FILE_MIGRATE_)(\d+)/;
var floodWaitRegexp = /^(FLOOD_WAIT_)(\d+)/;

function handleError(ctx, data) {
  var err = data.error;
  var {
    code,
    message
  } = err;
  if (floodWaitRegexp.test(message)) {
    return handleFloodWait(message, data, code, ctx);
  } else if (fileMigrateRegexp.test(message)) {
    return handleFileMigrate(message, data, code, ctx);
  } else if (migrateRegexp.test(message)) {
    return handleMigrateError(message, data, code, ctx);
  } else {
    switch (message) {
      case 'AUTH_KEY_UNREGISTERED':
        return handleAuthUnreg(ctx, message, data, code);
      case 'AUTH_RESTART':
        return handleAuthRestart(message, data, code);
    }
  }
  return { info: data, patch: emptyPatch() };
}

function numberFromError(message, regexp) {
  var matched = message.match(regexp);
  if (!matched || matched.length < 2) return Nothing();
  var [,, numStr] = matched;
  if (!isFinite(numStr)) return Nothing();
  var num = parseInt(numStr, 10);
  return Just(num);
}

var patchNothing = data => () => ({
  info: data,
  patch: emptyPatch()
});

var formatSeconds = seconds => new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'UTC'
}).format(new Date(seconds * 1000));

var floodWarning = (0, _ramda.pipe)(formatSeconds, (0, _warning2.default)({
  isIssue: false,
  message: ['Flood wait! Too many requests, you should wait', 'before new requests']
}));

function handleFloodWait(message, data, code, ctx) {
  return numberFromError(message, floodWaitRegexp).fold(patchNothing(data), waitTime => {
    floodWarning(waitTime);
    var info = Object.assign({}, data, {
      error: {
        code,
        message,
        handled: true
      }
    });
    return { info, patch: emptyPatch() };
  });
}

function handleFileMigrate(message, data, code, ctx) {
  var { uid, dc } = ctx;
  return numberFromError(message, fileMigrateRegexp)
  /*:: .map(toDCNumber) */
  .pred(dc => data.flags.methodResult).chain(newDc => (0, _query.queryRequest)(uid, dc, data.methodResult.outID).map(req => ({
    req,
    newDc
  }))).fold(patchNothing(data), ({ req, newDc }) => {
    req.dc = Just(newDc);
    var futureAuth = _configProvider2.default.authRequest.get(uid, newDc);
    if (!futureAuth) {
      var authReq = (0, _fluture.cache)((0, _invoke2.default)(uid, 'auth.exportAuthorization', { dc_id: newDc }).map(resp => {
        return resp;
      }).map(resp => {
        if (typeof resp === 'object' && resp != null) {
          if (typeof resp.id === 'number') {
            var { id } = resp;
            if (resp.bytes != null) {
              var { bytes } = resp;
              return {
                id,
                bytes: [...bytes]
              };
            }
          }
        }

        return resp;
      }).chain(resp => (0, _invoke2.default)(uid, 'auth.importAuthorization', resp, { dcID: newDc })));
      _configProvider2.default.authRequest.set(uid, newDc, authReq);
      authReq.promise();
    }
    var info = Object.assign({}, data, {
      error: {
        code,
        message,
        handled: true
      }
    });
    return { info, patch: emptyPatch() };
  });
}

function handleMigrateError(message, data, code, ctx) {
  var { uid, dc } = ctx;
  return numberFromError(message, migrateRegexp)
  /*:: .map(toDCNumber) */
  .fold(patchNothing(data), newDc => {
    (0, _state.dispatch)(_action.MAIN.RECOVERY_MODE({
      halt: dc,
      recovery: newDc,
      uid
    }), uid);
    _configProvider2.default.fastCache.init(uid, dc);
    _configProvider2.default.seq.set(uid, dc, 0);
    _configProvider2.default.halt.set(uid, dc, true);
    _configProvider2.default.halt.set(uid, newDc, false);
    //$off
    _configProvider2.default.session.set(uid, ctx.dc, null);
    Promise.all([_configProvider2.default.storageAdapter.set.dc(uid, newDc), _configProvider2.default.storageAdapter.set.nearestDC(uid, newDc)]).then(() => {
      (0, _state.dispatch)(_action.MAIN.DC_DETECTED({
        dc: newDc,
        uid
      }), uid);
    });
    var patch = {
      flags: {
        net: true,
        home: true
      },
      net: [{
        dc: data.dc,
        home: false
      }, {
        dc: newDc,
        home: true
      }],
      home: [newDc]
    };
    var info = Object.assign({}, data, {
      error: {
        code,
        message,
        handled: true
      }
    });
    return { info, patch };
  });
}

function handleAuthRestart(message, data, code) {
  var { dc } = data;
  // dispatch(MAIN.AUTH_UNREG(dc))

  var info = Object.assign({}, data, {
    error: {
      code,
      message,
      handled: true
    }
  });
  return { info, patch: {
      flags: {
        net: true,
        authKey: true
      },
      net: [{
        dc,
        authKey: []
      }],
      authKey: [{
        dc,
        authKey: false
      }]
    } };
}

function handleAuthUnreg(ctx, message, data, code) {
  var { dc, uid } = ctx;
  (0, _state.dispatch)(_action.MAIN.AUTH_UNREG(dc), uid);

  var info = Object.assign({}, data, {
    error: {
      code,
      message,
      handled: true
    }
  });
  return { info, patch: {
      flags: {
        net: true,
        authKey: true
      },
      net: [{
        dc,
        authKey: []
      }],
      authKey: [{
        dc,
        authKey: false
      }]
    } };
}

//$off
var emptyPatch = () => ({
  flags: {
    /*::
    net: true,
    */
  }
});

function handleNewSession(ctx, message) {
  var body = message.body;
  var { first_msg_id, server_salt } = body;
  var salt = (0, _bin.longToBytes)(server_salt);
  var { dc, id } = message;
  // const session = new Array(8)
  // random(session)
  // Config.seq.set(ctx.thread.uid, dc, 0)
  return {
    flags: {
      net: true,
      // session   : true,
      salt: true,
      ack: true,
      processAck: true
    },
    net: [{
      dc,
      salt,
      // session,
      seq: 0,
      first: first_msg_id // Refers to outcoming api message
    }],
    // session: [{
    //   dc,
    //   session,
    //   seq  : 0,
    //   first: first_msg_id,
    // }],
    salt: [{
      dc,
      salt
    }],
    ack: [{ dc, id }],
    processAck: [{ dc, id: first_msg_id }]
  };
}

function handleBadNotify(ctx, message) {
  var body = message.body;
  var { dc, uid } = ctx;
  log`Bad msg notification`(message);
  var {
    bad_msg_id: badMsg,
    bad_msg_seqno: seq,
    error_code: code
  } = body;
  var sentMessage = _configProvider2.default.fastCache.get(uid, dc).getSent(badMsg);
  var error = (0, _describeProtocolError2.default)(code || 0);
  errorPrint: {
    log`protocol error, code`(error.code);
    log`protocol error, message`(error.message);
    log`protocol error, description`(error.description);
  }
  if (!sentMessage || sentMessage.seq_no != seq) {
    log`Bad msg notification, seq`(badMsg, seq);
    // throw error
  }
  var { id } = message;

  var flags = {/*:: ack: true */};

  var data = {};

  if (code === 16 || code === 17) {
    if ((0, _timeManager.applyServerTime)(ctx.thread.uid, (0, _bin.rshift32)(id))) {

      var _session = new Array(8);
      (0, _secureRandom2.default)(_session);
      flags = Object.assign({}, flags, { session: true });
      data = Object.assign({}, data, {
        session: [{
          dc,
          session: _session,
          seq: 0,
          first: badMsg
        }]
      });
      var badMessage = ctx.thread.updateSentMessage(badMsg);
      if (badMessage instanceof _netMessage.NetMessage) {
        flags = Object.assign({}, flags, { resend: true });
        data = Object.assign({}, data, {
          resend: [{ dc, id: badMsg }]
        });
      }
      flags = Object.assign({}, flags, { ack: true });
      data = Object.assign({}, data, {
        ack: [{ dc, id }]
      });
    }
  }
  return Object.assign({}, data, {
    flags
  });
}

function handleBadSalt(ctx, message) {
  var body = message.body;
  log`Bad server salt`(message);
  var {
    bad_msg_id: badMsg,
    bad_msg_seqno: seq,
    error_code: code,
    new_server_salt: newSalt
  } = body;
  var { dc, uid } = ctx;
  var sentMessage = _configProvider2.default.fastCache.get(uid, dc).getSent(badMsg);
  var error = (0, _describeProtocolError2.default)(code || 0);
  errorPrint: {
    log`protocol error, code`(error.code);
    log`protocol error, message`(error.message);
    log`protocol error, description`(error.description);
  }
  if (!sentMessage || sentMessage.seq_no != seq) {
    log`invalid message, seq`(badMsg, seq);
    // throw error
  }
  var salt = (0, _bin.longToBytes)(newSalt);
  var { id } = message;
  var session = new Array(8);
  (0, _secureRandom2.default)(session);

  ctx.thread.pushResend(badMsg);
  return {
    flags: {
      net: true,
      session: true,
      salt: true,
      ack: true,
      resend: true
    },
    net: [{
      dc,
      salt,
      session,
      seq: 0,
      first: badMsg
    }],
    session: [{
      dc,
      session,
      seq: 0,
      first: badMsg
    }],
    salt: [{
      dc,
      salt
    }],
    ack: [{ dc, id }],
    resend: [{ dc, id: badMsg }]
  };
}

function handleRpcResult(ctx, message) {
  var { thread, dc, uid } = ctx;
  var { id } = message;
  var body = message.body;
  thread.ackMessage(id);

  var sentMessageID = body.req_msg_id;
  var sentMessage = _configProvider2.default.fastCache.get(uid, dc).getSent(sentMessageID);

  // thread.processMessageAck(sentMessageID)
  if (!sentMessage) {
    return emptyPatch();
  }
  (0, _state.dispatch)(_action.NETWORKER_STATE.SENT.DEL([sentMessage], dc), uid);
  _configProvider2.default.fastCache.get(uid, dc).deleteSent(sentMessage);
  if (body.result) {
    if (body.result._ == 'rpc_error') {
      thread.emit('rpc-error', {
        threadID: thread.threadID,
        networkerDC: dc,
        error: body.result,
        sentMessage,
        message
      });
    } else {
      thread.emit('rpc-result', {
        threadID: thread.threadID,
        networkerDC: dc,
        message,
        sentMessage,
        result: body.result
      });
    }
  }
  if (sentMessage.isAPI) thread.connectionInited = true;
  return emptyPatch();
}
//# sourceMappingURL=single-handler.js.map