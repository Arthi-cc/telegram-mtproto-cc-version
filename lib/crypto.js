'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CryptoWorker = undefined;

var _ramda = require('ramda');

var _runtime = require('./runtime');

var _defer = require('./util/defer');

var _defer2 = _interopRequireDefault(_defer);

var _mtprotoShared = require('mtproto-shared');

var _bin = require('./bin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var convertIfArray = val => Array.isArray(val) ? (0, _bin.convertToUint8Array)(val) : val;


var hasWindow = typeof window !== 'undefined';

var webWorker = !_runtime.isNode;
var taskID = 0;
var awaiting = {};
var webCrypto = isWebCrypto();
var useWebCrypto = webCrypto && !!webCrypto.digest;
var useSha1Crypto = useWebCrypto;
var useSha256Crypto = useWebCrypto;
var finalizeTask = (taskID, result) => {
  var deferred = awaiting[taskID];
  if (deferred) {
    deferred.resolve(result);
    delete awaiting[taskID];
  }
};

function isWebCrypto() {
  if (_runtime.isNode || !hasWindow) return false;
  //eslint-disable-next-line
  if (window.crypto === void 0 && window.msCrypto === void 0) return false;
  //eslint-disable-next-line
  return window.crypto && (window.crypto.subtle || window.crypto.webkitSubtle) ||
  //eslint-disable-next-line
  window.msCrypto && window.msCrypto.subtle;
}

var isCryptoTask = (0, _ramda.both)((0, _ramda.has)('taskID'), (0, _ramda.has)('result'));

//eslint-disable-next-line
var workerEnable = !_runtime.isNode && hasWindow && window.Worker && _runtime.isWebpack;
function initWorker() {
  var TmpWorker = void 0,
      tmpWorker = void 0;
  try {
    //$FlowIssue
    TmpWorker = require('worker-loader?inline&fallback=false!./worker.js');
  } catch (err) {
    console.error('webWorker disabled', err);
    webWorker = false;
    return;
  }
  try {
    tmpWorker = new TmpWorker();
  } catch (err) {
    console.error('webWorker disabled', err);
    webWorker = false;
    return;
  }

  // tmpWorker.onmessage = function(event) {
  //   console.info('CW tmpWorker.onmessage', event && event.data)
  // }
  tmpWorker.onmessage = e => {
    if (e.data === 'ready') {
      console.info('CW ready');
    } else if (!isCryptoTask(e.data)) {
      console.info('Not crypto task', e, e.data);
      return e;
    } else return webWorker ? finalizeTask(e.data.taskID, e.data.result) : webWorker = tmpWorker;
  };

  tmpWorker.onerror = function (error) {
    console.error('CW error', error, error.stack);
    webWorker = false;
  };
  tmpWorker.postMessage('b');
  webWorker = tmpWorker;
}
if (workerEnable) initWorker();

function performTaskWorker(task, params, embed) {
  // console.log(rework_d_T(), 'CW start', task)
  var deferred = (0, _defer2.default)();

  awaiting[taskID] = deferred;

  params.task = task;
  params.taskID = taskID;(embed || webWorker).postMessage(params);

  taskID++;

  return deferred.promise;
}

var sha1Hash = bytes => {
  if (useSha1Crypto) {
    // We don't use buffer since typedArray.subarray(...).buffer gives the whole buffer and not sliced one.
    // webCrypto.digest supports typed array
    var bytesTyped = convertIfArray(bytes);
    // console.log(rework_d_T(), 'Native sha1 start')
    return webCrypto.digest({ name: 'SHA-1' }, bytesTyped).then(digest =>
    // console.log(rework_d_T(), 'Native sha1 done')
    digest, e => {
      console.error('Crypto digest error', e);
      useSha1Crypto = false;
      return (0, _bin.sha1HashSync)(bytes);
    });
  }
  return (0, _mtprotoShared.immediate)(_bin.sha1HashSync, bytes);
};

var sha256Hash = bytes => {
  if (useSha256Crypto) {
    var bytesTyped = convertIfArray(bytes);
    // console.log(rework_d_T(), 'Native sha1 start')
    return webCrypto.digest({ name: 'SHA-256' }, bytesTyped).then(_ramda.identity
    // console.log(rework_d_T(), 'Native sha1 done')
    , e => {
      console.error('Crypto digest error', e);
      useSha256Crypto = false;
      return (0, _bin.sha256HashSync)(bytes);
    });
  }
  return (0, _mtprotoShared.immediate)(_bin.sha256HashSync, bytes);
};

var aesEncrypt = (bytes, keyBytes, ivBytes) => (0, _mtprotoShared.immediate)(() => (0, _bin.convertToArrayBuffer)((0, _bin.aesEncryptSync)(bytes, keyBytes, ivBytes)));

var aesDecrypt = (encryptedBytes, keyBytes, ivBytes) => (0, _mtprotoShared.immediate)(() => (0, _bin.convertToArrayBuffer)((0, _bin.aesDecryptSync)(encryptedBytes, keyBytes, ivBytes)));

function factorize(bytesSrc) {
  var bytes = (0, _bin.convertToByteArray)(bytesSrc);
  return webWorker ? performTaskWorker('factorize', { bytes }) : (0, _mtprotoShared.immediate)(_bin.pqPrimeFactorization, bytes);
}

var modPow = (x, y, m) => webWorker ? performTaskWorker('mod-pow', {
  x,
  y,
  m
}) : (0, _mtprotoShared.immediate)(_bin.bytesModPow, x, y, m);

var CryptoWorker = exports.CryptoWorker = {
  sha1Hash,
  sha256Hash,
  aesEncrypt,
  aesDecrypt,
  factorize,
  modPow
};

exports.default = CryptoWorker;
//# sourceMappingURL=crypto.js.map