

// import { fromNullable, Maybe } from 'folktale/maybe'

import { Maybe } from 'apropos';

import { MaybeT } from '../../util/monad-t';

import { getState } from '../portal';
import '../index.h';

import { toCryptoKey, toDCNumber } from '../../newtype.h';
import { KeyStorage } from '../../util/key-storage';

var { fromNullable } = Maybe;

export var resolveRequest = (uid, dc, outID) => getClient(uid).map(({ command }) => command).chain(command => command.maybeGetK(outID)).map(pair => pair.snd());

export var queryRequest = (uid, dc, outID) => resolveRequest(uid, dc, outID).chain(reqID => getClient(uid).chain(state => state.request.maybeGetK(reqID))).map(pair => pair.snd());

export function getClient(uid) {
  return fromNullable(getState).chain(e => fromNullable(e())).chain(e => fromNullable(e.client)).chain(e => fromNullable(e[uid]));
  // const { client } = getState()
  // return fromNullable(client[uid])
}

export var getHomeStatus = uid => getClient(uid).map(client => client.homeStatus).fold(() => false, x => x);

var keyQuery = selector => (uid, dc) => getClient(uid).map(selector).chain(fromNullable).chain(keyStorage => keyStorage.getMaybe(dc));
/*:: .map(toCryptoKey) */

export var queryHomeDc = uid => getClient(uid).map(client => client.homeDc).chain(fromNullable);
/*:: .map(toDCNumber) */

export var queryAuthID = keyQuery(client => client.authID);
export var queryAuthKey = keyQuery(client => client.auth);
export var querySalt = keyQuery(client => client.salt);

export var queryKeys = (uid, dc) => fromNullable(dc).chain(dcʹ => MaybeT.traverse3(queryAuthKey(uid, dcʹ), queryAuthID(uid, dcʹ), querySalt(uid, dcʹ)).map(([auth, authID, salt]) => ({
  uid,
  dc: dcʹ,
  auth,
  authID,
  salt
})));

export var queryAck = (uid, dc) => getClient(uid).map(client => client.pendingAck[dc]).chain(fromNullable).fold(() => [], x => x);
//# sourceMappingURL=index.js.map