'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _most = require('most');

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

var _makeEventStream = require('./make-event-stream');

var _main = require('../service/main');

var _request = require('../service/main/request');

var _request2 = _interopRequireDefault(_request);

var _networker = require('../service/networker');

var _networker2 = _interopRequireDefault(_networker);

var _netMessage = require('../service/networker/net-message');

var _error = require('../error');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`stream-bus`;

var createStreamBus = ctx => {
  var emitter = _configProvider2.default.rootEmitter(ctx.uid);
  var bus = makeStreamMap(emitter);

  bus.responseRaw.observe(log('raw response'));

  bus.messageIn.observe(log('message in'));

  var apiOnly = bus.messageIn.filter(value => value.isAPI);
  var mtOnly = bus.messageIn.filter(value => !value.isAPI);

  apiOnly.observe(val => {
    _configProvider2.default.fastCache.get(ctx.uid, val.dc).messages.set(val.msg_id, val);
  });
  mtOnly.observe(val => {
    _configProvider2.default.fastCache.get(ctx.uid, val.dc).messages.set(val.msg_id, val);
  });

  /* bus.rpcResult.observe(async(data: OnRpcResult) => {
    log('rpc result')(data)
    data.sentMessage.deferred.resolve(data.result)
    ctx.state.messages.delete(data.sentMessage.msg_id)
    const requestID = data.sentMessage.requestID
    if (typeof requestID !== 'string') return
    const req = ctx.state.requests.get(requestID)
    if (req) {
      // data.sentMessage.deferred.reject('No such request!')
      req.defer.resolve(data.result)
      ctx.state.requests.delete(requestID)
    }
  }) */

  bus.rpcError.observe(log('rpc error'));

  /* bus.rpcError.observe(async({ error, ...data }: OnRpcError) => {
    if (error instanceof RpcApiError === false)
      throw error
    if (isFileMigrateError(error)) {
      const newDc = getFileMigrateDc(error)
      if (typeof newDc !== 'number') throw error
      if (!ctx.state.messages.has(data.message.req_msg_id)) {
        data.sentMessage.deferred.reject(error)
        return log('on file migrate error')(data.message.req_msg_id, 'req_msg_id not found')
      }
      const msg = ctx.state.messages.get(data.message.req_msg_id)
      if (!msg || !msg.requestID || typeof msg.requestID !== 'string') {
        data.sentMessage.deferred.reject(error)
        return log('on file migrate error')('msg', msg)
      }
      const req = ctx.state.requests.get(msg.requestID)
      if (!req) {
        data.sentMessage.deferred.reject(error)
        return log('on file migrate error')('req', req)
      }
      req.options.dc = newDc
      log('file migrate', 'req')(req)
      log('on file migrate restart')('before end')
      await ctx.api.invokeNetRequest(req)
    } if (isMigrateError(error)) {
      const newDc = getMigrateDc(error)
      if (typeof newDc !== 'number') throw error
      await ctx.storage.set('dc', newDc)
      if (!ctx.state.messages.has(data.message.req_msg_id)) {
        data.sentMessage.deferred.reject(error)
        return log('on migrate error')(data.message.req_msg_id, 'req_msg_id not found')
      }
      const msg = ctx.state.messages.get(data.message.req_msg_id)
      if (!msg || !msg.requestID || typeof msg.requestID !== 'string') {
        data.sentMessage.deferred.reject(error)
        return log('on migrate error')('msg', msg)
      }
      const req = ctx.state.requests.get(msg.requestID)
      if (!req) {
        data.sentMessage.deferred.reject(error)
        return log('on migrate error')('req', req)
      }
      req.options.dc = newDc
      log('migrate', 'req')(req)
      log('on migrate restart')('before end')
      await ctx.api.invokeNetRequest(req)
    } else if (isAuthRestart(error)) {
      if (!ctx.state.messages.has(data.message.req_msg_id)) {
        data.sentMessage.deferred.reject(error)
        return log('error', 'auth restart')(data.message.req_msg_id, 'req_msg_id not found')
      }
      const msg = ctx.state.messages.get(data.message.req_msg_id)
      if (!msg || !msg.requestID) {
        data.sentMessage.deferred.reject(error)
        return log('error', 'auth restart')('no requestID msg', msg)
      }
      const req = ctx.state.requests.get(msg.requestID)
      if (!req) {
        data.sentMessage.deferred.reject(error)
        return log('error', 'on auth restart')('no request info', msg)
      }
      const { authKey, saltKey } = dcStoreKeys(data.networkerDC)
      log('on auth restart')(authKey, saltKey)
      await ctx.storage.remove(authKey, saltKey)
      log('on auth restart')('before end')
      // await ctx.api.doAuth()
      await ctx.api.invokeNetRequest(req)
    } else if (error.code === 401) {
       log('rpc', 'auth key unreg')(data.sentMessage)
      const reqId = data.sentMessage.requestID
      if (!reqId) {
        data.sentMessage.deferred.reject(error)
        return log('error', 'auth key unreg')('no requestID msg', data.sentMessage)
      }
      const dc = data.sentMessage.dc
      const req = ctx.state.requests.get(reqId)
      if (!req || !dc) {
        data.sentMessage.deferred.reject(error)
        return log('error', 'on auth key unreg')('no request info', dc, reqId)
      }
       // const { authKey, saltKey } = dcStoreKeys(dc)
      // await ctx.storage.remove(authKey)
      const thread = ctx.state.threads.get(data.threadID)
      if (!thread) {
        data.sentMessage.deferred.reject(error)
        return log('error', 'on auth key unreg')('no thread', dc, data.threadID)
      }
      ctx.api.authBegin = false
      log('on auth key unreg')('before end')
      // const nearest = await ctx.storage.get('nearest_dc')
       await ctx.storage.set('dc', currentDc)
      // await new Promise(rs => setTimeout(rs, 1e3))
      req.options.dc = currentDc
      // await ctx.api.doAuth()
      await ctx.api.invokeNetRequest(req)
    } else {
      log('rpc', 'unhandled')(data)
      log('rpc', 'unhandled', 'error')(error)
      // data.sentMessage.deferred.reject(error)
    }
  }) */

  // bus.netMessage.observe((message) => {
  //   log('net message')(message)
  //   const req = ctx.state.messages.get(message.msg_id)
  //   log('req')(req)
  // })

  // bus.netMessage.observe(log('new request'))

  /* bus.newSession.observe(async({
    threadID,
    networkerDC,
    message,
    messageID
  }) => {
    const thread = ctx.state.threads.get(threadID)
    if (!thread) {
      log`new session, error, no thread`(threadID, messageID)
      return
    }
    // await thread.applyServerSalt(message.server_salt)
    // thread.ackMessage(messageID)
    // thread.processMessageAck(message.first_msg_id)
     log`new session, handled`(messageID, networkerDC)
     const repeatRequest =
      (req: ApiRequest) =>
        of(req)
          .map(ctx.api.invokeNetRequest)
          .awaitPromises()
     await from(ctx.state.requests.values())
      // .debounce(30)
      .map(repeatRequest)
      .mergeConcurrently(1)
      .observe(log`recurring requests`)
  }) */

  bus.untypedMessage.observe(log`untyped`);

  // bus.noAuth.observe(async({
  //   dc,
  //   apiReq,
  //   error
  //   }: NoAuth) => {
  //   // const mainDc  = await ctx.storage.get('dc')
  //   // if (dc === mainDc) {

  //   // } else {

  //   // }
  // })

  return bus;
};

var an = {};

var responseRawCast = an;
var newNetworkerCast = an;
var rpcResultCast = an;
var rpcErrorCast = an;
var untypedMessageCast = an;
var newRequestCast = an;
var messageInCast = an;
var newSessionCast = an;
var noAuthCast = an;

function makeStreamMap(emitter) {
  var getter = (0, _makeEventStream.makeEventStream)(emitter);

  var responseRaw = getter('response-raw', responseRawCast);
  var newNetworker = getter('new-networker', newNetworkerCast);
  var rpcError = getter('rpc-error', rpcErrorCast);
  var rpcResult = getter('rpc-result', rpcResultCast);
  var untypedMessage = getter('untyped-message', untypedMessageCast);
  var newRequest = getter('new-request', newRequestCast);
  var messageIn = getter('message-in', messageInCast);
  var newSession = getter('new-session', newSessionCast);
  var noAuth = getter('no-auth', noAuthCast);

  return {
    responseRaw,
    newNetworker,
    rpcError,
    untypedMessage,
    newRequest,
    messageIn,
    rpcResult,
    newSession,
    noAuth
  };
}

exports.default = createStreamBus;
//# sourceMappingURL=stream-bus.js.map