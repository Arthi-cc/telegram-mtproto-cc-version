'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAck = exports.queryKeys = exports.querySalt = exports.queryAuthKey = exports.queryAuthID = exports.queryHomeDc = exports.getHomeStatus = exports.queryRequest = exports.resolveRequest = undefined;
exports.getClient = getClient;

var _apropos = require('apropos');

var _monadT = require('../../util/monad-t');

var _portal = require('../portal');

require('../index.h');

var _newtype = require('../../newtype.h');

var _keyStorage = require('../../util/key-storage');

// import { fromNullable, Maybe } from 'folktale/maybe'

var { fromNullable } = _apropos.Maybe;

var resolveRequest = exports.resolveRequest = (uid, dc, outID) => getClient(uid).map(({ command }) => command).chain(command => command.maybeGetK(outID)).map(pair => pair.snd());

var queryRequest = exports.queryRequest = (uid, dc, outID) => resolveRequest(uid, dc, outID).chain(reqID => getClient(uid).chain(state => state.request.maybeGetK(reqID))).map(pair => pair.snd());

function getClient(uid) {
  return fromNullable(_portal.getState).chain(e => fromNullable(e())).chain(e => fromNullable(e.client)).chain(e => fromNullable(e[uid]));
  // const { client } = getState()
  // return fromNullable(client[uid])
}

var getHomeStatus = exports.getHomeStatus = uid => getClient(uid).map(client => client.homeStatus).fold(() => false, x => x);

var keyQuery = selector => (uid, dc) => getClient(uid).map(selector).chain(fromNullable).chain(keyStorage => keyStorage.getMaybe(dc));
/*:: .map(toCryptoKey) */

var queryHomeDc = exports.queryHomeDc = uid => getClient(uid).map(client => client.homeDc).chain(fromNullable);
/*:: .map(toDCNumber) */

var queryAuthID = exports.queryAuthID = keyQuery(client => client.authID);
var queryAuthKey = exports.queryAuthKey = keyQuery(client => client.auth);
var querySalt = exports.querySalt = keyQuery(client => client.salt);

var queryKeys = exports.queryKeys = (uid, dc) => fromNullable(dc).chain(dcʹ => _monadT.MaybeT.traverse3(queryAuthKey(uid, dcʹ), queryAuthID(uid, dcʹ), querySalt(uid, dcʹ)).map(([auth, authID, salt]) => ({
  uid,
  dc: dcʹ,
  auth,
  authID,
  salt
})));

var queryAck = exports.queryAck = (uid, dc) => getClient(uid).map(client => client.pendingAck[dc]).chain(fromNullable).fold(() => [], x => x);
//# sourceMappingURL=index.js.map