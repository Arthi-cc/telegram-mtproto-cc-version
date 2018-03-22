'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bin = require('../bin');

var tasks = {
  factorize({ bytes }) {
    var byteArray = (0, _bin.convertToByteArray)(bytes);
    return (0, _bin.pqPrimeFactorization)(byteArray);
  },
  modPow: ({ x, y, m }) => (0, _bin.bytesModPow)(x, y, m),
  sha1Hash: ({ bytes }) => (0, _bin.sha1HashSync)(bytes),
  aesEncrypt: ({ bytes, keyBytes, ivBytes }) => (0, _bin.aesEncryptSync)(bytes, keyBytes, ivBytes),
  aesDecrypt: ({ encryptedBytes, keyBytes, ivBytes }) => (0, _bin.aesDecryptSync)(encryptedBytes, keyBytes, ivBytes)
};

exports.default = tasks;
//# sourceMappingURL=tasks.js.map