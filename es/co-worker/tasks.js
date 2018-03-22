import { pqPrimeFactorization, bytesModPow, sha1HashSync, aesEncryptSync, aesDecryptSync, convertToByteArray } from '../bin';

var tasks = {
  factorize({ bytes }) {
    var byteArray = convertToByteArray(bytes);
    return pqPrimeFactorization(byteArray);
  },
  modPow: ({ x, y, m }) => bytesModPow(x, y, m),
  sha1Hash: ({ bytes }) => sha1HashSync(bytes),
  aesEncrypt: ({ bytes, keyBytes, ivBytes }) => aesEncryptSync(bytes, keyBytes, ivBytes),
  aesDecrypt: ({ encryptedBytes, keyBytes, ivBytes }) => aesDecryptSync(encryptedBytes, keyBytes, ivBytes)
};

export default tasks;
//# sourceMappingURL=tasks.js.map