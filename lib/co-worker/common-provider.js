'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _runtime = require('../runtime');

function testWebCrypto() {
  var webCrypto = void 0;

  try {
    /* eslint-disable */
    if (typeof window !== 'undefined') {
      if (window.crypto) {
        webCrypto = window.crypto.subtle || window.crypto.webkitSubtle;
      } else if (window.msCrypto) {
        webCrypto = window.msCrypto.subtle;
      }
    }
  } finally {
    return webCrypto;
  }
}


var cryptoCommon = (() => {
  var webCrypto = testWebCrypto();
  var useWebCrypto = !!webCrypto;

  return {
    webCrypto,
    use: {
      webCrypto: useWebCrypto,
      sha1Crypto: useWebCrypto,
      sha256Crypto: useWebCrypto,
      webworker: !_runtime.isNode
    }
  };
})();

exports.default = cryptoCommon;
//# sourceMappingURL=common-provider.js.map