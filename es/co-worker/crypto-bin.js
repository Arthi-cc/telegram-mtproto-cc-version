import { immediateWrap } from 'mtproto-shared';
import tasks from './tasks';

var CryptoBin = () => ({
  factorize: immediateWrap(tasks.factorize),
  modPow: immediateWrap(tasks.modPow),
  sha1Hash: immediateWrap(tasks.sha1Hash),
  aesEncrypt: immediateWrap(tasks.aesEncrypt),
  aesDecrypt: immediateWrap(tasks.aesDecrypt)
});

export default CryptoBin;
//# sourceMappingURL=crypto-bin.js.map