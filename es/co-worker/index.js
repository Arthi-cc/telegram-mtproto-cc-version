import Webworker from './web-worker';
import CryptoBin from './crypto-bin';
import cryptoCommon from './common-provider';


export default function getCrypto() {
  var cryptoWorker = CryptoBin();
  var useWorker = cryptoCommon.use.webworker;
  if (useWorker) {
    try {
      var webWorker = Webworker.of();


      cryptoWorker.factorize = args => webWorker.run('factorize', args);
      cryptoWorker.modPow = args => webWorker.run('mod-pow', args);
    } catch (err) {
      useWorker = false;
    }
  }
  cryptoCommon.use.webworker = useWorker;

  return Object.assign({}, cryptoCommon, {
    Crypto: cryptoWorker
  });
}
//# sourceMappingURL=index.js.map