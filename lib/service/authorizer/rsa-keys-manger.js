'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = KeyManager;

require('../main/index.h');

var _tl = require('../../tl');

var _writer = require('../../tl/writer');

var _bin = require('../../bin');

var _configProvider = require('../../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function KeyManager(uid, publisKeysHex, { get, set }) {

  publisKeysHex.forEach(key => mapPrepare(uid, set, key));

  return fingerprints => selectRsaKeyByFingerPrint(uid, get, fingerprints);
}

function selectRsaKeyByFingerPrint(uid, get, fingerprints) {
  var fingerprintHex = void 0,
      foundKey = void 0;
  for (var _iterator = fingerprints, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var fingerprint = _ref;

    fingerprintHex = (0, _bin.strDecToHex)(fingerprint);
    foundKey = get(uid, fingerprintHex);
    if (foundKey) return Object.assign({ fingerprint }, foundKey);
  }
  throw new Error('[Key manager] No public key found');
}

function mapPrepare(uid, set, { modulus, exponent }) {
  var RSAPublicKey = new _tl.Serialization({}, uid);
  var rsaBox = RSAPublicKey.writer;
  (0, _writer.writeBytes)(rsaBox, (0, _bin.bytesFromHex)(modulus));
  (0, _writer.writeBytes)(rsaBox, (0, _bin.bytesFromHex)(exponent));

  var buffer = rsaBox.getBuffer();

  var fingerprintBytes = (0, _bin.sha1BytesSync)(buffer).slice(-8);
  fingerprintBytes.reverse();
  var key = (0, _bin.bytesToHex)(fingerprintBytes);
  set(uid, key, {
    modulus,
    exponent
  });
}
//# sourceMappingURL=rsa-keys-manger.js.map