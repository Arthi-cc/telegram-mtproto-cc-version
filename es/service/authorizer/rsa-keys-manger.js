import '../main/index.h';
import { Serialization } from '../../tl';

import { writeBytes } from '../../tl/writer';

import { bytesToHex, sha1BytesSync, bytesFromHex, strDecToHex } from '../../bin';
import Config from '../../config-provider';

export default function KeyManager(uid, publisKeysHex, { get, set }) {

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

    fingerprintHex = strDecToHex(fingerprint);
    foundKey = get(uid, fingerprintHex);
    if (foundKey) return Object.assign({ fingerprint }, foundKey);
  }
  throw new Error('[Key manager] No public key found');
}

function mapPrepare(uid, set, { modulus, exponent }) {
  var RSAPublicKey = new Serialization({}, uid);
  var rsaBox = RSAPublicKey.writer;
  writeBytes(rsaBox, bytesFromHex(modulus));
  writeBytes(rsaBox, bytesFromHex(exponent));

  var buffer = rsaBox.getBuffer();

  var fingerprintBytes = sha1BytesSync(buffer).slice(-8);
  fingerprintBytes.reverse();
  var key = bytesToHex(fingerprintBytes);
  set(uid, key, {
    modulus,
    exponent
  });
}
//# sourceMappingURL=rsa-keys-manger.js.map