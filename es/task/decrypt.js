function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import { encaseP, of, reject } from 'fluture';

import './index.h';
import { isApiObject } from './fixtures';
import parser from '../service/chain';
import { queryKeys } from '../state/query';
import Config from '../config-provider';

export function decrypt(_ref) {
  var { result: { data }, dc, uid } = _ref,
      input = _objectWithoutProperties(_ref, ['result', 'dc', 'uid']);

  return queryKeys(uid, dc).fold(reject, of).mapRej(ERR.noKeys).map(keys => Object.assign({}, input, keys, {
    data,
    dc,
    uid,
    session: Config.session.get(uid, dc)
  })).chain(decryptor).chain(validateDecrypt).map(decrypted => Object.assign({}, input, { dc, uid }, decrypted));
}

var decryptor = (_ref2) => {
  var { thread, data, uid, dc, authID, auth, session } = _ref2,
      rest = _objectWithoutProperties(_ref2, ['thread', 'data', 'uid', 'dc', 'authID', 'auth', 'session']);

  return encaseP(parser, {
    responseBuffer: data,
    uid,
    dc,
    authKeyID: authID,
    authKey: auth,
    thisSessionID: session,
    prevSessionID: thread.prevSessionID,
    getMsgById: thread.getMsgById
  }).map(result => Object.assign({}, result, { thread, uid, dc, authID, auth, session }, rest));
};

function validateDecrypt(decrypted) {
  var { response } = decrypted;
  if (!isApiObject(response)) {
    return reject(ERR.invalidResponse());
  }
  return of(decrypted);
}

class NoSessionKeys extends Error {}
class InvalidResponse extends Error {}
var ERR = {
  noKeys: () => new NoSessionKeys('No session keys'),
  invalidResponse: () => new InvalidResponse('Invalid decrypted response')
};
//# sourceMappingURL=decrypt.js.map