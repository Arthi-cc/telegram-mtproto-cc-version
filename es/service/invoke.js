import { tap } from 'ramda';
// import { Just } from 'folktale/maybe'
import { Maybe } from 'apropos';
var { Just } = Maybe;
import { tryP, of as ofF } from 'fluture';

import Auth from './authorizer';
import './main/index.h';

import '../newtype.h';
import { API } from '../state/action';
import { dispatch } from '../state';
import { createThread } from './networker';

import Config from '../config-provider';
import ApiRequest from './main/request';

import { MaybeT } from '../util/monad-t';
import { queryHomeDc, queryKeys } from '../state/query';

export var makeAuthRequest = netReq => MaybeT.toFuture(ERR.noDC, queryReqDc(netReq)).chain(dc => withDC(netReq.uid, dc)).map(networker => networker.wrapApiCall(netReq)).chain(msg => tryP(() => msg.deferred.promise)).mapRej(tap(e => netReq.defer.reject(e))).chain(() => tryP(() => netReq.defer.promise));

var queryReqDc = netReq => netReq.dc.fold(() => queryHomeDc(netReq.uid), x => Just(x));

function withDC(uid, dc) {
  var newThread = () => createThread(dc, uid);


  return MaybeT.toFutureR(queryKeys(uid, dc)).chainRej(() => authRequest(uid, dc)).map(() => Config.thread.get(uid, dc).fold(newThread, x => x));
}

export var authRequest = (uid, dc) => Auth(uid, dc).bimap(tap(e => console.error('Auth error', e.message, e.stack)), ({
  authKey, authKeyID, serverSalt, dc
}) => ({
  auth: authKey,
  salt: serverSalt,
  // authKeyID,
  dc
}));

export default function invoke(uid, method, params = {}, options = {}) {
  return ofF().map(() => {
    var netReq = new ApiRequest({ method, params }, Object.assign({}, options), uid,
    //$off
    options.dcID);
    dispatch(API.REQUEST.NEW({
      netReq,
      method,
      params,
      timestamp: Date.now()
    }, netReq.requestID), uid);
    return netReq;
  }).chain(netReq => tryP(() => netReq.deferFinal.promise));
}

var ERR = {
  noDC: () => /*:: typedError(NoDCError,*/
  new Error('get Networker without dcID') /*::) */
  , isNothing() {
    throw new Error(`UnsafeMaybeValue recieve nothing`);
  }
};
//# sourceMappingURL=invoke.js.map