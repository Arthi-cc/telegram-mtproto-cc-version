'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getCrypto;

var _webWorker = require('./web-worker');

var _webWorker2 = _interopRequireDefault(_webWorker);

var _cryptoBin = require('./crypto-bin');

var _cryptoBin2 = _interopRequireDefault(_cryptoBin);

var _commonProvider = require('./common-provider');

var _commonProvider2 = _interopRequireDefault(_commonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCrypto() {
  var cryptoWorker = (0, _cryptoBin2.default)();
  var useWorker = _commonProvider2.default.use.webworker;
  if (useWorker) {
    try {
      var webWorker = _webWorker2.default.of();


      cryptoWorker.factorize = args => webWorker.run('factorize', args);
      cryptoWorker.modPow = args => webWorker.run('mod-pow', args);
    } catch (err) {
      useWorker = false;
    }
  }
  _commonProvider2.default.use.webworker = useWorker;

  return Object.assign({}, _commonProvider2.default, {
    Crypto: cryptoWorker
  });
}
//# sourceMappingURL=index.js.map