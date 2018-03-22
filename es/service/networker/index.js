function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import Bluebird from 'bluebird';
import uuid from '../../util/uuid';
import { contains, toPairs } from 'ramda';
import { fromEvent } from 'most';
import Emitter from 'eventemitter2';
import { smartTimeout, immediate } from 'mtproto-shared';

import { tsNow } from '../time-manager';
import { NetMessage, NetContainer } from './net-message';

import { Serialization, TypeWriter } from '../../tl';
import { writeInnerMessage } from '../chain/perform-request';
import Config from '../../config-provider';
import { requestNextSeq } from '../../state/reaction';
import { queryAck, queryHomeDc } from '../../state/query';
import ApiRequest from '../main/request';
import { writeInt, writeBytes, writeLong } from '../../tl/writer';

import LongPoll from '../../plugins/long-poll';
import { NET, NETWORKER_STATE } from '../../state/action';
import '../main/index.h';

import '../../newtype.h';
import { dispatch } from '../../state';
import L1Cache from '../../l1-cache';

import Logger from 'mtproto-logger';
var log = Logger`networker`;

var iii = 0;
var akStopped = false;

var storeIntString = writer => ([field, value]) => {
  switch (typeof value) {
    case 'string':
      return writeBytes(writer, value);
    case 'number':
      return writeInt(writer, value, field);
    default:
      throw new Error(`tl storeIntString field ${field} value type ${typeof value}`);
  }
};

function addInitialMessage(serialBox, appConfig) {
  var mapper = storeIntString(serialBox);
  //$off
  var pairs = toPairs(appConfig);
  pairs.forEach(mapper);
}

function addAfterMessage(serialBox, id) {
  writeInt(serialBox, 0xcb9f372d, 'invokeAfterMsg');
  writeLong(serialBox, id, 'msg_id');
}

function isHomeDC(uid, dc) {
  return queryHomeDc(uid).map(x => x === dc).fold(() => false, x => x);
}

export class NetworkerThread {

  constructor(dc, uid) {
    _initialiseProps.call(this);

    this.uid = uid;
    var emitter = Config.rootEmitter(this.uid);
    this.emit = emitter.emit;
    //$off
    this.dcID = dc;
    this.iii = iii++;

    //$FlowIssue
    Object.defineProperties(this, {
      performSheduledRequest: {
        value: this.performSheduledRequest.bind(this),
        enumerable: false,
        writable: false
      },
      wrapMtpCall: {
        value: this.wrapMtpCall.bind(this),
        enumerable: false
      }
    });
    Config.fastCache.init(uid, this.dcID);
    Config.thread.set(uid, this.dcID, this);
    this.longPoll = new LongPoll(this);
    // // this.checkLongPollCond = this.checkLongPollCond.bind(this)
    // this.serverSalt = serverSalt
    // Bluebird.all([
    //   storage.set(keyNames.authKey, bytesToHex(authKey)),
    //   storage.set(keyNames.saltKey, bytesToHex(serverSalt))
    // ]).then(() => {
    // })

    emitter.emit('new-networker', this);

    // this.updateSession()
    setInterval(() => this.checkLongPoll(), 10000); //NOTE make configurable interval
    // this.checkLongPoll()
  }
  get state() {
    return Config.fastCache.get(this.uid, this.dcID);
  }
  // updateSession() {
  //   this.prevSessionID = this.sessionID
  //   this.sessionID = new Array(8)
  //   random(this.sessionID)
  // }

  updateSentMessage(sentMessageID) {
    if (!this.state.hasSent(sentMessageID)) {
      return false;
    }
    var sentMessage = this.state.getSent(sentMessageID);
    var newInner = [];
    if (sentMessage instanceof NetContainer) {
      for (var _iterator = sentMessage.inner, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var innerID = _ref;

        var innerSentMessage = this.updateSentMessage(innerID);
        if (innerSentMessage) newInner.push(innerSentMessage.msg_id);
      }
    }
    // dispatch(NETWORKER_STATE.SENT.DEL([sentMessage], this.dcID))
    this.state.deleteSent(sentMessage);
    var seq_no = requestNextSeq(this.uid, this.dcID, sentMessage.notContentRelated || sentMessage.container);
    var newMessage = sentMessage.clone(seq_no, this.dcID);
    if (newMessage instanceof NetContainer) {
      newMessage.inner = newInner;
    }
    this.state.addSent(newMessage);
    // dispatch(NETWORKER_STATE.SENT.ADD([newMessage], this.dcID))
    return newMessage;
  }

  wrapMtpCall(method, params, options) {
    var serializer = new Serialization({ mtproto: true }, this.uid);

    serializer.storeMethod(method, params);
    var seqNo = requestNextSeq(this.uid, this.dcID);
    var message = new NetMessage(this.uid, this.dcID, seqNo, serializer.getBytes(true));
    this.pushMessage(message, options);
    return message.deferred.promise;
  }

  wrapMtpMessage(object, options = {}) {
    var serializer = new Serialization({ mtproto: true }, this.uid);
    serializer.storeObject(object, 'Object', 'wrap_message');

    var seqNo = requestNextSeq(this.uid, this.dcID, options.notContentRelated);
    var message = new NetMessage(this.uid, this.dcID, seqNo, serializer.getBytes(true), 'ack/resend');
    this.pushMessage(message, options);
    return message;
  }

  wrapApiCall(netReq) {
    var {
      data: {
        method,
        params
      },
      options,
      requestID
    } = netReq;
    var serializer = new Serialization(options, this.uid);
    var serialBox = serializer.writer;
    if (!this.connectionInited) {
      addInitialMessage(serialBox, Config.apiConfig.get(this.uid));
    }
    if (typeof options.afterMessageID === 'string') addAfterMessage(serialBox, options.afterMessageID);

    options.resultType = serializer.storeMethod(method, params);

    var seqNo = requestNextSeq(this.uid, this.dcID);
    var message = new NetMessage(this.uid, this.dcID, seqNo, serializer.getBytes(true), 'api');
    message.isAPI = true;
    message.requestID = requestID;
    this.pushMessage(message, options);
    return message;
  }

  checkLongPollCond() {
    return this.longPoll.pendingTime > tsNow() || !!this.offline || akStopped;
  }
  checkLongPollAfterDcCond(isClean) {
    return isClean && !isHomeDC(this.uid, this.dcID);
  }

  checkLongPoll() {
    this.cleanupSent();
    // if (this.checkLongPollCond())
    //   return false
    // if (this.checkLongPollAfterDcCond(isClean))
    // // console.warn(dTime(), 'Send long-poll for DC is delayed', this.dcID, this.sleepAfter)
    //   return

    this.pollEvents.emit('poll');
  }

  pushMessage(message, options = {}) {
    message.copyOptions(options);
    dispatch(NETWORKER_STATE.SENT.ADD([message], this.dcID), this.uid);
    // dispatch(NETWORKER_STATE.PENDING.ADD([message.msg_id], this.dcID))
    options.messageID = message.msg_id; //TODO remove mutable operation
    this.state.addSent(message);
    this.state.setPending(message.msg_id);

    if (!options.noShedule) this.sheduleRequest();
  }

  pushResend(messageID, delay = 0) {
    var value = tsNow() + delay;
    var sentMessage = this.state.getSent(messageID);
    if (sentMessage instanceof NetContainer) {
      for (var _iterator2 = sentMessage.inner, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var msg = _ref2;

        this.state.setPending(msg, value);
      }
      // dispatch(NETWORKER_STATE.PENDING.ADD(sentMessage.inner, this.dcID))
    } else {
      // dispatch(NETWORKER_STATE.PENDING.ADD([messageID], this.dcID))
      this.state.setPending(messageID, value);
    }
    this.sheduleRequest(delay);
  }

  checkConnection() {
    return _asyncToGenerator(function* () {})();
  }

  toggleOffline(enabled) {
    // console.log('toggle ', enabled, this.dcID, this.iii)
    if (!this.offline !== undefined && this.offline == enabled) return false;

    this.offline = enabled;

    if (this.offline) {
      smartTimeout.cancel(this.nextReqPromise);
      delete this.nextReq;

      if (this.checkConnectionPeriod < 1.5) this.checkConnectionPeriod = 0;

      this.checkConnectionPromise = smartTimeout(this.checkConnection, parseInt(this.checkConnectionPeriod * 1000));
      this.checkConnectionPeriod = Math.min(30, (1 + this.checkConnectionPeriod) * 1.5);

      // this.onOnlineCb = this.checkConnection
      // this.emit('net.offline', this.onOnlineCb)
    } else {
      this.longPoll.pendingTime = Date.now();
      //NOTE check long state was here
      this.checkLongPoll();
      this.sheduleRequest();

      // if (this.onOnlineCb)
      //   this.emit('net.online', this.onOnlineCb)

      smartTimeout.cancel(this.checkConnectionPromise);
    }
  }
  performResend() {
    if (this.state.hasResends()) {
      var resendMsgIDs = [...this.state.getResends()];

      // console.log('resendReq messages', resendMsgIDs)
      var msg = this.wrapMtpMessage({
        _: 'msg_resend_req',
        msg_ids: resendMsgIDs
      }, { noShedule: true, notContentRelated: true });
      this.lastResendReq = {
        req_msg_id: msg.msg_id,
        resend_msg_ids: resendMsgIDs
      };
    }
  }
  performSheduledRequest() {
    //TODO extract huge method
    // console.log(dTime(), 'sheduled', this.dcID, this.iii)
    if (this.offline || akStopped) {
      log`Cancel sheduled`(``);
      return Bluebird.resolve(false);
    }
    delete this.nextReq;
    var ackMsgIDs = queryAck(this.uid, this.dcID);
    if (ackMsgIDs.length > 0) {
      log`acking messages`(ackMsgIDs);
      this.wrapMtpMessage({
        _: 'msgs_ack',
        msg_ids: ackMsgIDs
      }, {
        notContentRelated: true,
        noShedule: true
      }); //TODO WTF Why we make wrapped message and doesnt use it?
      // const res = await msg.deferred.promise
      // log(`AWAITED`, `ack`)(res)
      dispatch(NET.ACK_DELETE({ dc: this.dcID, ack: ackMsgIDs }), this.uid);
    }

    this.performResend();

    var messages = [];
    //$off
    var message = void 0;
    var messagesByteLen = 0;
    var lengthOverflow = false;
    var pendingIds = [];
    for (var _iterator3 = this.state.pendingIterator(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref3 = _i3.value;
      }

      var [_messageID, value] = _ref3;

      if (value && value < tsNow()) continue;
      this.state.deletePending(_messageID);
      pendingIds.push(_messageID);
      if (!this.state.hasSent(_messageID)) continue;
      message = this.state.getSent(_messageID);
      var messageByteLength = message.size() + 32;
      var cond1 = !message.notContentRelated && lengthOverflow;
      var cond2 = !message.notContentRelated && messagesByteLen + messageByteLength > 655360; // 640 Kb
      if (cond1) continue;
      if (cond2) {
        lengthOverflow = true;
        continue;
      }
      messages.push(message);
      messagesByteLen += messageByteLength;
    }
    // dispatch(NETWORKER_STATE.PENDING.DEL(pendingIds, this.dcID))
    messages.map(msg => this.emit('message-in', msg));

    if (!message) return Bluebird.resolve(false); //TODO Why?

    if (message.isAPI && !message.longPoll) {
      var serializer = new Serialization({ mtproto: true }, this.uid);

      serializer.storeMethod('http_wait', {
        max_delay: 0,
        wait_after: 100,
        max_wait: 5000
      });
      var netMessage = new NetMessage(this.uid, this.dcID, requestNextSeq(this.uid, this.dcID), serializer.getBytesPlain(), 'polling');
      this.longPoll.writePollTime();
      messages.push(netMessage);
    }

    if (!messages.length) {
      // console.log('no sheduled messages')
      return Bluebird.resolve(false);
    }

    var noResponseMsgs = [];

    if (messages.length > 1) {
      var container = new Serialization({ mtproto: true, startMaxLength: messagesByteLen + 64 }, this.uid);
      var contBox = container.writer;
      writeInt(contBox, 0x73f1f8dc, 'CONTAINER[id]');
      writeInt(contBox, messages.length, 'CONTAINER[count]');

      var {
        innerMessages,
        noResponseMessages
      } = writeInnerMessage({
        writer: contBox,
        messages
      });
      noResponseMsgs = noResponseMessages;
      var innerApi = messages.reduce((acc, val) => {
        if (!val.isAPI) return [...acc, false];
        return [...acc, val.requestID /*::|| '' */];
      }, []);
      message = new NetContainer(this.uid, this.dcID, requestNextSeq(this.uid, this.dcID, true), container.getBytes(true), innerMessages, innerApi);
    } else {
      if (message.noResponse) noResponseMsgs.push(message.msg_id);
    }
    this.state.addSent(message);

    if (lengthOverflow) this.sheduleRequest();
    dispatch(NET.SEND({
      message,
      options: {},
      threadID: this.threadID,
      thread: this,
      noResponseMsgs
    }, this.dcID), this.uid);
    return Bluebird.resolve(true);
  }

  /* async applyServerSalt(newServerSalt: string) {
    const serverSalt = longToBytes(newServerSalt)
    await this.storage.set(`dc${ this.dcID }_server_salt`, bytesToHex(serverSalt))
      this.serverSalt = serverSalt
    return true
  } */

  sheduleRequest(delay = 0) {
    if (this.offline) this.checkConnection();
    var nextReq = tsNow() + delay;

    if (delay && this.nextReq && this.nextReq <= nextReq) return false;

    smartTimeout.cancel(this.nextReqPromise);
    if (delay > 0) this.nextReqPromise = smartTimeout(this.performSheduledRequest, delay);else immediate(this.performSheduledRequest);

    this.nextReq = nextReq;
  }

  ackMessage(msgID) {
    var ackMsgIDs = queryAck(this.uid, this.dcID);
    if (contains(msgID, ackMsgIDs)) return;
    dispatch(NET.ACK_ADD({ dc: this.dcID, ack: [msgID] }), this.uid);
    this.sheduleRequest(30000);
  }

  reqResendMessage(msgID) {
    log`Req resend`(msgID);
    this.state.addResend(msgID);
    this.sheduleRequest(100);
  }

  cleanupSent() {
    var notEmpty = false;
    // console.log('clean start', this.dcID/*, this.state.sent*/)
    var sentDel = [];
    for (var _iterator4 = this.state.sentIterator(), _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray4) {
        if (_i4 >= _iterator4.length) break;
        _ref4 = _iterator4[_i4++];
      } else {
        _i4 = _iterator4.next();
        if (_i4.done) break;
        _ref4 = _i4.value;
      }

      var [msgID, message] = _ref4;

      var complete = true;
      if (message.notContentRelated && !this.state.hasPending(msgID)) {
        sentDel.push(message);
        // console.log('clean notContentRelated', msgID)
        this.state.deleteSent(message);
      } else if (message instanceof NetContainer) {
        for (var _iterator5 = message.inner, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
          var _ref5;

          if (_isArray5) {
            if (_i5 >= _iterator5.length) break;
            _ref5 = _iterator5[_i5++];
          } else {
            _i5 = _iterator5.next();
            if (_i5.done) break;
            _ref5 = _i5.value;
          }

          var inner = _ref5;

          if (this.state.hasSent(inner)) {
            // console.log('clean failed, found', msgID, message.inner[i],
            // this.state.getSent(message.inner[i]).seq_no)
            notEmpty = true;
            complete = false;
            break;
          }
        }
        // console.log('clean container', msgID)
        if (complete) {
          sentDel.push(message);
          this.state.deleteSent(message);
        }
      } else notEmpty = true;
    }
    dispatch(NETWORKER_STATE.SENT.DEL(sentDel, this.dcID), this.uid);
    return !notEmpty;
  }

  processMessage(message, messageID, sessionID) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!isFinite(messageID)) {
        throw new TypeError(`Message ID should be finite ${messageID} ${typeof messageID}`);
      }
      var msgidInt = parseInt(messageID, 10);
      if (msgidInt % 2) {
        console.warn('[MT] Server even message id: ', messageID, message);
        return;
      }
      switch (message._) {
        case 'msg_container':
          {
            /* for (const inner of message.messages)
              await this.processMessage(inner, inner.msg_id, sessionID) */
            break;
          }
        case 'bad_server_salt':
          {
            // log(`Bad server salt`)(message)
            // const sentMessage = this.state.getSent(message.bad_msg_id)
            // if (!sentMessage || sentMessage.seq_no != message.bad_msg_seqno) {
            //   log(`invalid message`)(message.bad_msg_id, message.bad_msg_seqno)
            //   throw new Error('[MT] Bad server salt for invalid message')
            // }

            // await this.applyServerSalt(message.new_server_salt)
            // this.pushResend(message.bad_msg_id)
            // this.ackMessage(messageID)
            break;
          }
        case 'bad_msg_notification':
          {
            /* log(`Bad msg notification`)(message)
            const sentMessage = this.state.getSent(message.bad_msg_id)
            if (!sentMessage || sentMessage.seq_no != message.bad_msg_seqno) {
              log(`invalid message`)(message.bad_msg_id, message.bad_msg_seqno)
              throw new Error('[MT] Bad msg notification for invalid message')
            }
              if (message.error_code == 16 || message.error_code == 17) {
              if (applyServerTime(
                this.uid,
                rshift32(messageID)
              )) {
                log(`Update session`)()
                this.updateSession()
              }
              const badMessage = this.updateSentMessage(message.bad_msg_id)
              if (badMessage instanceof NetMessage)
                this.pushResend(badMessage.msg_id)
              this.ackMessage(messageID)
            } */
            break;
          }
        case 'message':
          {
            /* if (this.lastServerMessages.indexOf(messageID) != -1) {
              // console.warn('[MT] Server same messageID: ', messageID)
              this.ackMessage(messageID)
              return
            }
            this.lastServerMessages.push(messageID)
            if (this.lastServerMessages.length > 100) {
              this.lastServerMessages.shift()
            }
            await this.processMessage(message.body, message.msg_id, sessionID) */
            break;
          }
        case 'new_session_created':
          {
            // this.ackMessage(messageID)

            // this.processMessageAck(message.first_msg_id)
            // await this.applyServerSalt(message.server_salt)

            /* this.emit('new-session', {
              threadID   : this.threadID,
              networkerDC: this.dcID,
              messageID,
              message
            }) */

            // const baseDcID = await this.storage.get('dc')
            // const updateCond =
            //   baseDcID === this.dcID &&
            //   !this.upload &&
            //   updatesProcessor
            // if (updateCond)
            //   updatesProcessor(message, true)

            break;
          }
        case 'msgs_ack':
          {
            /* message.msg_ids.forEach(this.processMessageAck) */
            break;
          }
        case 'msg_detailed_info':
          {
            /* if (!this.state.hasSent(message.msg_id)) {
              this.ackMessage(message.answer_msg_id)
              break
            } */
            break;
          }
        case 'msg_new_detailed_info':
          {
            /* this.ackMessage(message.answer_msg_id)
            this.reqResendMessage(message.answer_msg_id) */
            break;
          }
        case 'msgs_state_info':
          {
            /*  this.ackMessage(message.answer_msg_id)
              const lastResendReq = this.lastResendReq
              if (!lastResendReq) break
              if (lastResendReq.req_msg_id != message.req_msg_id) break
              // const resendDel = []
              for (const badMsgID of lastResendReq.resend_msg_ids) {
                // resendDel.push(badMsgID)
                this.state.deleteResent(badMsgID)
              } */
            // dispatch(NETWORKER_STATE.RESEND.DEL(resendDel, this.dcID))
            break;
          }
        case 'rpc_result':
          {
            _this.ackMessage(messageID);

            var sentMessageID = message.req_msg_id;
            var sentMessage = _this.state.getSent(sentMessageID);

            _this.processMessageAck(sentMessageID);
            if (!sentMessage) break;
            // dispatch(NETWORKER_STATE.SENT.DEL([sentMessage], this.dcID))
            _this.state.deleteSent(sentMessage);
            if (message.result._ == 'rpc_error') {
              _this.emit('rpc-error', {
                threadID: _this.threadID,
                networkerDC: _this.dcID,
                error: message.result,
                sentMessage,
                message
              });
            } else {
              _this.emit('rpc-result', {
                threadID: _this.threadID,
                networkerDC: _this.dcID,
                message,
                sentMessage,
                result: message.result
              });
              if (sentMessage.isAPI) _this.connectionInited = true;
            }

            break;
          }
        default:
          {
            _this.ackMessage(messageID);
            /* this.emit('untyped-message', {
              threadID   : this.threadID,
              networkerDC: this.dcID,
              message,
              messageID,
              sessionID,
              result     : message.result
            })
            if (updatesProcessor) updatesProcessor(message, true) */
            break;
          }
      }
    })();
  }
}

var _initialiseProps = function () {
  var _this2 = this;

  this.threadID = uuid();
  this.upload = false;
  this.connectionInited = false;
  this.checkConnectionPeriod = 0;
  this.lastServerMessages = [];

  this.pollEvents = (() => {
    var emitter = new Emitter();
    return emitter;
  })();

  this.runLongPoll = _asyncToGenerator(function* () {
    yield _this2.longPoll.sendLongPool();
    _this2.checkLongPoll();
  });
  this.poll = fromEvent('poll', this.pollEvents).throttle(50).observe(this.runLongPoll);

  this.getMsgById = ({ req_msg_id }) => this.state.getSent(req_msg_id);

  this.processMessageAck = messageID => {
    var sentMessage = this.state.getSent(messageID);
    if (sentMessage && !sentMessage.acked) {
      delete sentMessage.body;
      sentMessage.acked = true;
      return true;
    }
    return false;
  };
};

export function createThread(dc, uid) {
  return new NetworkerThread(dc, uid);
}

export default NetworkerThread;
//# sourceMappingURL=index.js.map