import Rusha from 'rusha';
import * as CryptoJSlib from '@goodmind/node-cryptojs-aes';
var { CryptoJS } = CryptoJSlib;
import { inflate } from 'pako/lib/inflate';

import random from './service/secure-random';

import { eGCD_, greater, divide_, str2bigInt, equalsInt, isZero, bigInt2str, copy_, copyInt_, rightShift_, leftShift_, sub_, add_, powMod, bpe, one } from './vendor/leemon';

var rushaInstance = new Rusha(1024 * 1024);

export function generateNonce() {
  var nonce = new Array(16);
  for (var i = 0; i < 16; i++) {
    nonce[i] = nextRandomInt(0xFF);
  }return nonce;
}

export function bytesToString(bytes) {
  var ln = bytes.length;
  var temp = new Array(ln);
  for (var i = 0; i < ln; ++i) {
    temp[i] = String.fromCharCode(bytes[i]);
  }var result = temp.join('');
  return result;
}

export function stringToChars(str) {
  var ln = str.length;
  var result = Array(ln);
  for (var i = 0; i < ln; ++i) {
    result[i] = str.charCodeAt(i);
  }return result;
}

export var strDecToHex = str => bigInt2str(str2bigInt(str, 10, 0), 16).toLowerCase();

export function bytesToHex(bytes = []) {
  var arr = [];
  for (var i = 0; i < bytes.length; i++) {
    arr.push((bytes[i] < 16 ? '0' : '') + (bytes[i] || 0).toString(16));
  }
  return arr.join('');
}

export function bytesFromHex(hexString) {
  var len = hexString.length;
  var start = 0;
  var bytes = [];

  if (hexString.length % 2) {
    bytes.push(parseInt(hexString.charAt(0), 16));
    start++;
  }

  for (var i = start; i < len; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }

  return bytes;
}

export function bytesCmp(bytes1, bytes2) {
  var len = bytes1.length;
  if (len !== bytes2.length) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (bytes1[i] !== bytes2[i]) return false;
  }
  return true;
}

export function bytesXor(bytes1, bytes2) {
  var len = bytes1.length;
  var bytes = [];

  for (var i = 0; i < len; ++i) {
    bytes[i] = bytes1[i] ^ bytes2[i];
  }

  return bytes;
}

export function bytesToWords(bytes) {
  if (bytes instanceof ArrayBuffer) {
    bytes = new Uint8Array(bytes);
  }
  var len = bytes.length;
  var words = [];
  var i = void 0;
  for (i = 0; i < len; i++) {
    words[i >>> 2] |= bytes[i] << 24 - i % 4 * 8;
  }

  return new CryptoJS.lib.WordArray.init(words, len);
}

export function bytesFromWords(wordArray) {
  var words = wordArray.words;
  var sigBytes = wordArray.sigBytes;
  var bytes = [];

  for (var i = 0; i < sigBytes; i++) {
    bytes.push(words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff);
  }

  return bytes;
}

export function bytesFromLeemonBigInt(bigInt) {
  var str = bigInt2str(bigInt, 16);
  return bytesFromHex(str);
}

export function bytesToArrayBuffer(b) {
  return new Uint8Array(b).buffer;
}

export function convertToArrayBuffer(bytes) {
  // Be careful with converting subarrays!!
  if (bytes instanceof ArrayBuffer) {
    return bytes;
  }
  if (bytes instanceof Uint8Array) {
    //$FlowIssue
    if (bytes.buffer.byteLength == bytes.length * bytes.BYTES_PER_ELEMENT) return bytes.buffer;
  }
  return bytesToArrayBuffer(bytes);
}

export function convertToUint8Array(bytes) {
  if (bytes instanceof Uint8Array) return bytes;
  if (Array.isArray(bytes)) return new Uint8Array(bytes);
  if (bytes instanceof ArrayBuffer) return new Uint8Array(bytes);
  throw new TypeError(`convertToUint8Array mismatch! ${bytes}`);
}

export function convertToByteArray(bytes) {
  if (Array.isArray(bytes)) return bytes;
  var bytesUint8 = convertToUint8Array(bytes);
  var ln = bytesUint8.length;
  if (ln === 0) {
    return [];
  }
  var newBytes = new Array(ln);
  newBytes[0] = 0;
  for (var i = 0; i < ln; i++) {
    newBytes[i] = bytesUint8[i];
  }return newBytes;
}

export function bytesFromArrayBuffer(buffer) {
  var byteView = new Uint8Array(buffer);
  var bytes = Array.from(byteView);
  return bytes;
}

export function bufferConcat(buffer1, buffer2) {
  var set1 = void 0,
      set2 = void 0,
      l1 = void 0,
      l2 = void 0;
  if (buffer1 instanceof ArrayBuffer) {
    l1 = buffer1.byteLength;
    set1 = new Uint8Array(buffer1);
  } else {
    l1 = buffer1.length;
    set1 = buffer1;
  }

  if (buffer2 instanceof ArrayBuffer) {
    l2 = buffer2.byteLength;
    set2 = new Uint8Array(buffer2);
  } else {
    l2 = buffer2.length;
    set2 = buffer2;
  }

  var tmp = new Uint8Array(l1 + l2);
  tmp.set(set1, 0);
  tmp.set(set2, l1);

  return tmp.buffer;
}

// const dividerBig = bigint(0x100000000)
var dividerLem = str2bigInt('100000000', 16, 4);

// const printTimers = (timeL, timeB, a, b, n) => setTimeout(
//   () => console.log(`Timer L ${timeL} B ${timeB}`, ...a, ...b, n || ''),
//   100)

export function longToInts(sLong) {
  var lemNum = str2bigInt(sLong, 10, 6);
  var div = new Array(lemNum.length);
  var rem = new Array(lemNum.length);
  divide_(lemNum, dividerLem, div, rem);
  var resL = [
  //$FlowIssue
  ~~bigInt2str(div, 10),
  //$FlowIssue
  ~~bigInt2str(rem, 10)];
  return resL;
}

export function longToBytes(sLong) {
  return bytesFromWords({ words: longToInts(sLong), sigBytes: 8 }).reverse();
}

export function lshift32(high, low) {
  var highNum = str2bigInt(high.toString(), 10, 6);
  var nLow = str2bigInt(low.toString(), 10, 6);
  leftShift_(highNum, 32);

  add_(highNum, nLow);
  var res = bigInt2str(highNum, 10);
  return res;
}

export var rshift32 = str => {
  var num = str2bigInt(str, 10, 6);
  rightShift_(num, 32);
  return bigInt2str(num, 10);
};

export function intToUint(val) {
  //$FlowIssue
  var result = ~~val;
  if (result < 0) result = result + 0x100000000;
  return result;
}

var middle = 0x100000000 / 2 - 1;

export function uintToInt(val) {
  if (val > middle) val = val - 0x100000000;
  return val;
}

export function sha1HashSync(bytes) {
  // console.log(dT(), 'SHA-1 hash start', bytes.byteLength || bytes.length)
  var hashBytes = rushaInstance.rawDigest(bytes).buffer;
  // console.log(dT(), 'SHA-1 hash finish')

  return hashBytes;
}

export function sha1BytesSync(bytes) {
  return bytesFromArrayBuffer(sha1HashSync(bytes));
}

export function sha256HashSync(bytes) {
  // console.log(dT(), 'SHA-2 hash start', bytes.byteLength || bytes.length)
  var hashWords = CryptoJS.SHA256(bytesToWords(bytes));
  // console.log(dT(), 'SHA-2 hash finish')

  var hashBytes = bytesFromWords(hashWords);

  return hashBytes;
}

export function rsaEncrypt(publicKey, bytes) {
  var newBytes = addPadding(bytes, 255);

  var N = str2bigInt(publicKey.modulus, 16, 256);
  var E = str2bigInt(publicKey.exponent, 16, 256);
  var X = str2bigInt(bytesToHex(newBytes), 16, 256);
  var encryptedBigInt = powMod(X, E, N),
      encryptedBytes = bytesFromHex(bigInt2str(encryptedBigInt, 16));

  return encryptedBytes;
}

var addPadding = (bytes, blockSize = 16, zeroes = false) => {
  var len = void 0;

  if (bytes instanceof ArrayBuffer) {
    len = bytes.byteLength;
  } else {
    len = bytes.length;
  }

  var result = bytes;

  var needPadding = blockSize - len % blockSize;
  if (needPadding > 0 && needPadding < blockSize) {
    var padding = new Array(needPadding);
    if (zeroes) {
      for (var i = 0; i < needPadding; i++) {
        padding[i] = 0;
      }
    } else random(padding);
    if (bytes instanceof ArrayBuffer) {
      result = bufferConcat(bytes, padding);
    } else result = bytes.concat(padding);
  }

  return result;
};

export function aesEncryptSync(bytes, keyBytes, ivBytes) {
  // console.log(dT(), 'AES encrypt start', len/*, bytesToHex(keyBytes), bytesToHex(ivBytes)*/)aesEncryptSync

  var newBytes = addPadding(bytes);
  var encryptedWords = CryptoJS.AES.encrypt(bytesToWords(newBytes), bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  }).ciphertext;

  var encryptedBytes = bytesFromWords(encryptedWords);
  // console.log(dT(), 'AES encrypt finish')

  return encryptedBytes;
}

export function aesDecryptSync(encryptedBytes, keyBytes, ivBytes) {

  // console.log(dT(), 'AES decrypt start', encryptedBytes.length)
  var decryptedWords = CryptoJS.AES.decrypt({ ciphertext: bytesToWords(encryptedBytes) }, bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  });

  var bytes = bytesFromWords(decryptedWords);
  // console.log(dT(), 'AES decrypt finish')

  return bytes;
}

export function gzipUncompress(bytes) {
  // console.log('Gzip uncompress start')
  var result = inflate(bytes);
  // console.log('Gzip uncompress finish')
  return result;
}

export function nextRandomInt(maxValue) {
  return Math.floor(Math.random() * maxValue);
}

export function pqPrimeFactorization(pqBytes) {
  var minSize = Math.ceil(64 / bpe) + 1;

  // const what = new BigInteger(pqBytes)
  var hex = bytesToHex(pqBytes);
  var lWhat = str2bigInt(hex, 16, minSize);
  var result = pqPrimeLeemon(lWhat);
  return result;
}

export function pqPrimeLeemon(what) {
  var minLen = Math.ceil(64 / bpe) + 1;
  var it = 0;
  var q = void 0,
      lim = void 0;
  var a = new Array(minLen);
  var b = new Array(minLen);
  var c = new Array(minLen);
  var g = new Array(minLen);
  var z = new Array(minLen);
  var x = new Array(minLen);
  var y = new Array(minLen);

  for (var i = 0; i < 3; i++) {
    q = (nextRandomInt(128) & 15) + 17;
    copyInt_(x, nextRandomInt(1000000000) + 1);
    copy_(y, x);
    lim = 1 << i + 18;

    for (var j = 1; j < lim; j++) {
      ++it;
      copy_(a, x);
      copy_(b, x);
      copyInt_(c, q);

      while (!isZero(b)) {
        if (b[0] & 1) {
          add_(c, a);
          if (greater(c, what)) {
            sub_(c, what);
          }
        }
        add_(a, a);
        if (greater(a, what)) {
          sub_(a, what);
        }
        rightShift_(b, 1);
      }

      copy_(x, c);
      if (greater(x, y)) {
        copy_(z, x);
        sub_(z, y);
      } else {
        copy_(z, y);
        sub_(z, x);
      }
      eGCD_(z, what, g, a, b);
      if (!equalsInt(g, 1)) {
        break;
      }
      if ((j & j - 1) === 0) {
        copy_(y, x);
      }
    }
    if (greater(g, one)) {
      break;
    }
  }

  divide_(what, g, x, y);

  var [P, Q] = greater(g, x) ? [x, g] : [g, x];

  // console.log(dT(), 'done', bigInt2str(what, 10), bigInt2str(P, 10), bigInt2str(Q, 10))

  return [bytesFromLeemonBigInt(P), bytesFromLeemonBigInt(Q), it];
}

export function bytesModPow(x, y, m) {
  var xBigInt = str2bigInt(bytesToHex(x), 16);
  var yBigInt = str2bigInt(bytesToHex(y), 16);
  var mBigInt = str2bigInt(bytesToHex(m), 16);
  var resBigInt = powMod(xBigInt, yBigInt, mBigInt);

  return bytesFromHex(bigInt2str(resBigInt, 16));
}
//# sourceMappingURL=bin.js.map