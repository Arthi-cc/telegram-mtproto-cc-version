'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decrypt = decrypt;

var _fluture = require('fluture');

require('./index.h');

var _fixtures = require('./fixtures');

var _chain = require('../service/chain');

var _chain2 = _interopRequireDefault(_chain);

var _query = require('../state/query');

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function decrypt(_ref) {
  var { result: { data }, dc, uid } = _ref,
      input = _objectWithoutProperties(_ref, ['result', 'dc', 'uid']);

  return (0, _query.queryKeys)(uid, dc).fold(_fluture.reject, _fluture.of).mapRej(ERR.noKeys).map(keys => Object.assign({}, input, keys, {
    data,
    dc,
    uid,
    session: _configProvider2.default.session.get(uid, dc)
  })).chain(decryptor).chain(validateDecrypt).map(decrypted => Object.assign({}, input, { dc, uid }, decrypted));
}

var decryptor = (_ref2) => {
  var { thread, data, uid, dc, authID, auth, session } = _ref2,
      rest = _objectWithoutProperties(_ref2, ['thread', 'data', 'uid', 'dc', 'authID', 'auth', 'session']);

  return (0, _fluture.encaseP)(_chain2.default, {
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
  if (!(0, _fixtures.isApiObject)(response)) {
    return (0, _fluture.reject)(ERR.invalidResponse());
  }
  return (0, _fluture.of)(decrypted);
}

class NoSessionKeys extends Error {}
class InvalidResponse extends Error {}
var ERR = {
  noKeys: () => new NoSessionKeys('No session keys'),
  invalidResponse: () => new InvalidResponse('Invalid decrypted response')
};
//# sourceMappingURL=decrypt.js.map