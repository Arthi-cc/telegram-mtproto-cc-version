import { identity, has, both } from 'ramda';
import { isNode, isWebpack } from './runtime';

import blueDefer from './util/defer';

import { immediate } from 'mtproto-shared';
import { convertToUint8Array, sha1HashSync, sha256HashSync, aesEncryptSync, aesDecryptSync, convertToByteArray, convertToArrayBuffer, pqPrimeFactorization, bytesModPow } from './bin';

var convertIfArray = val => Array.isArray(val) ? convertToUint8Array(val) : val;

var hasWindow = typeof window !== 'undefined';

var webWorker = !isNode;
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
  if (isNode || !hasWindow) return false;
  //eslint-disable-next-line
  if (window.crypto === void 0 && window.msCrypto === void 0) return false;
  //eslint-disable-next-line
  return window.crypto && (window.crypto.subtle || window.crypto.webkitSubtle) ||
  //eslint-disable-next-line
  window.msCrypto && window.msCrypto.subtle;
}

var isCryptoTask = both(has('taskID'), has('result'));

//eslint-disable-next-line
var workerEnable = !isNode && hasWindow && window.Worker && isWebpack;
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
  var deferred = blueDefer();

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
      return sha1HashSync(bytes);
    });
  }
  return immediate(sha1HashSync, bytes);
};

var sha256Hash = bytes => {
  if (useSha256Crypto) {
    var bytesTyped = convertIfArray(bytes);
    // console.log(rework_d_T(), 'Native sha1 start')
    return webCrypto.digest({ name: 'SHA-256' }, bytesTyped).then(identity
    // console.log(rework_d_T(), 'Native sha1 done')
    , e => {
      console.error('Crypto digest error', e);
      useSha256Crypto = false;
      return sha256HashSync(bytes);
    });
  }
  return immediate(sha256HashSync, bytes);
};

var aesEncrypt = (bytes, keyBytes, ivBytes) => immediate(() => convertToArrayBuffer(aesEncryptSync(bytes, keyBytes, ivBytes)));

var aesDecrypt = (encryptedBytes, keyBytes, ivBytes) => immediate(() => convertToArrayBuffer(aesDecryptSync(encryptedBytes, keyBytes, ivBytes)));

function factorize(bytesSrc) {
  var bytes = convertToByteArray(bytesSrc);
  return webWorker ? performTaskWorker('factorize', { bytes }) : immediate(pqPrimeFactorization, bytes);
}

var modPow = (x, y, m) => webWorker ? performTaskWorker('mod-pow', {
  x,
  y,
  m
}) : immediate(bytesModPow, x, y, m);

export var CryptoWorker = {
  sha1Hash,
  sha256Hash,
  aesEncrypt,
  aesDecrypt,
  factorize,
  modPow
};

export default CryptoWorker;
//# sourceMappingURL=crypto.js.map