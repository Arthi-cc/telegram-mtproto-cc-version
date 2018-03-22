'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authRequest = exports.makeAuthRequest = undefined;
exports.default = invoke;

var _ramda = require('ramda');

var _apropos = require('apropos');

var _fluture = require('fluture');

var _authorizer = require('./authorizer');

var _authorizer2 = _interopRequireDefault(_authorizer);

require('./main/index.h');

require('../newtype.h');

var _action = require('../state/action');

var _state = require('../state');

var _networker = require('./networker');

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

var _request = require('./main/request');

var _request2 = _interopRequireDefault(_request);

var _monadT = require('../util/monad-t');

var _query = require('../state/query');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var { Just } = _apropos.Maybe;
// import { Just } from 'folktale/maybe'
var makeAuthRequest = exports.makeAuthRequest = netReq => _monadT.MaybeT.toFuture(ERR.noDC, queryReqDc(netReq)).chain(dc => withDC(netReq.uid, dc)).map(networker => networker.wrapApiCall(netReq)).chain(msg => (0, _fluture.tryP)(() => msg.deferred.promise)).mapRej((0, _ramda.tap)(e => netReq.defer.reject(e))).chain(() => (0, _fluture.tryP)(() => netReq.defer.promise));

var queryReqDc = netReq => netReq.dc.fold(() => (0, _query.queryHomeDc)(netReq.uid), x => Just(x));

function withDC(uid, dc) {
  var newThread = () => (0, _networker.createThread)(dc, uid);


  return _monadT.MaybeT.toFutureR((0, _query.queryKeys)(uid, dc)).chainRej(() => authRequest(uid, dc)).map(() => _configProvider2.default.thread.get(uid, dc).fold(newThread, x => x));
}

var authRequest = exports.authRequest = (uid, dc) => (0, _authorizer2.default)(uid, dc).bimap((0, _ramda.tap)(e => console.error('Auth error', e.message, e.stack)), ({
  authKey, authKeyID, serverSalt, dc
}) => ({
  auth: authKey,
  salt: serverSalt,
  // authKeyID,
  dc
}));

function invoke(uid, method, params = {}, options = {}) {
  return (0, _fluture.of)().map(() => {
    var netReq = new _request2.default({ method, params }, Object.assign({}, options), uid,
    //$off
    options.dcID);
    (0, _state.dispatch)(_action.API.REQUEST.NEW({
      netReq,
      method,
      params,
      timestamp: Date.now()
    }, netReq.requestID), uid);
    return netReq;
  }).chain(netReq => (0, _fluture.tryP)(() => netReq.deferFinal.promise));
}

var ERR = {
  noDC: () => /*:: typedError(NoDCError,*/
  new Error('get Networker without dcID') /*::) */
  , isNothing() {
    throw new Error(`UnsafeMaybeValue recieve nothing`);
  }
};
//# sourceMappingURL=invoke.js.map