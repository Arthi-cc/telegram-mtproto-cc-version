function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { cache, Fluture, encaseP, of, reject } from 'fluture';

import { DcUrlError } from '../../error';
import Config from '../../config-provider';
import { MAIN } from '../../state/action';
import { dispatch } from '../../state';
import { Serialization, Deserialization } from '../../tl';

import random from '../secure-random';
import { applyServerTime, tsNow } from '../time-manager';

import { bytesCmp, bytesToHex, sha1BytesSync, aesEncryptSync, aesDecryptSync, bytesToArrayBuffer, bytesFromHex, bytesXor, generateNonce } from '../../bin';
import { bpe, str2bigInt, one, dup, sub_, sub, greater } from '../../vendor/leemon';
import { toCryptoKey } from '../../newtype.h';

import './index.h';

import { fetchDHInner, fetchDhParam, fetchResPQ, fetchServerDh, writeReqPQ, writeReqDH, writeInnerDH } from './fetch-object';
import primeHex from './prime-hex';
import sendPlainReq from './send-plain-req';

import Logger from 'mtproto-logger';

var log = Logger`auth`;

export default function Auth(uid, dc) {
  var savedReq = Config.authRequest.get(uid, dc);
  if (savedReq) {
    return savedReq;
  }

  var runThread = getUrl(uid, dc).chain(url => authFuture(uid, dc, url)).map(res => Object.assign({}, res, { uid })).chain(res => encaseP((() => {
    var _ref = _asyncToGenerator(function* (res) {
      var setter = Config.storageAdapter.set;
      yield setter.salt(uid, dc, res.serverSalt);
      yield setter.authKey(uid, dc, res.authKey);
      yield setter.authID(uid, dc, res.authKeyID);
      return res;
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })(), res)).map(res => (dispatch(MAIN.AUTH.RESOLVE(res), uid), res));
  var future = cache(runThread);
  Config.authRequest.set(uid, dc, future);
  return future;
}

var failureHandler = (uid, dc) => err => {
  log`authChain, error`(err);
  Config.authRequest.remove(uid, dc);
  return err;
};

var modPowF = encaseP(Config.common.Crypto.modPow);
var modPowPartial = (b, dhPrime) => x => modPowF({ x, y: b, m: dhPrime }); /*::.mapRej(cryptoErr)*/

var factorize = encaseP(Config.common.Crypto.factorize);

var normalizeResPQ = res => Object.assign({
  serverNonce: res.server_nonce,
  pq: res.pq,
  fingerprints: res.server_public_key_fingerprints
}, res);

var makePqBlock = uid => ctx => {
  var { serverNonce, fingerprints, pq, it } = ctx;
  log`PQ factorization done`(it);
  log`Got ResPQ`(bytesToHex(serverNonce), bytesToHex(pq), fingerprints);

  try {
    var publicKey = Config.publicKeys.select(uid, fingerprints);
    return of(Object.assign({}, ctx, { publicKey }));
  } catch (err) {
    console.trace('select');

    return reject(err);
  }
};

function getUrl(uid, dc) {
  var url = Config.dcMap(uid, dc);
  if (typeof url !== 'string') return reject(new DcUrlError(dc, url));
  log`mtpAuth, dc, url`(dc, url);
  return of(url);
}

function authFuture(uid, dc, url) {
  var nonce = newNonce();

  return of(writeReqPQ(uid, nonce)).chain(sendPlainReq(uid, url)).map(fetchResPQ).chain(assertResPQ(nonce)).map(normalizeResPQ).chain(factorizePQInner).chain(makePqBlock(uid)).map(oneMoreNonce).chain(mtpSendReqDh(uid, url)).chain(authKeyFuture(uid, url)).map(data => Object.assign({}, data, { dc })).mapRej(failureHandler(uid, dc));
}

function newNonce() {
  var nonce = generateNonce();
  log`Send req_pq`(bytesToHex(nonce));
  return nonce;
}

function oneMoreNonce(auth) {
  var newNonce = random(new Array(32));
  log`afterReqDH`('Send req_DH_params');
  return Object.assign({}, auth, { newNonce });
}

var factorizePQInner = ctx => factorize({ bytes: ctx.pq }).map(([p, q, it]) => Object.assign({}, ctx, { p, q, it }));
/*::.mapRej(cryptoErr)*/

var assertResPQ = nonce => response => {
  if (response._ !== 'resPQ') {
    return reject(ERR.sendPQ.response(response._)); /*::.mapRej(sendPqFail)*/
  }
  if (!bytesCmp(nonce, response.nonce)) {
    return reject(ERR.sendPQ.nonce()); /*::.mapRej(sendPqFail)*/
  }

  return of(response); /*::.mapRej(sendPqFail)*/
};

var authKeyFuture = (uid, url) => auth => {
  var {
    g, gA,
    nonce,
    serverNonce,
    dhPrime
  } = auth;
  var gBytes = bytesFromHex(g.toString(16));

  var b = random(new Array(256));

  var modPowFuture = modPowPartial(b, dhPrime);

  return modPowFuture(gBytes).map(gB => writeInnerDH(uid, auth, gB)).map(prepareData(uid, url, auth)).chain(sendPlainReq(uid, url)).map(fetchDhParam).chain(assertDhParams(nonce, serverNonce)).both(modPowFuture(gA)).map(authKeysGen).chain(dhChoose(uid, url, auth)).map(result => Object.assign({}, result, auth));
};

var prepareData = (uid, url, auth) => dataWithHash => {
  var {
    g,
    serverNonce,
    nonce,
    tmpAesKey,
    tmpAesIv
  } = auth;

  var encryptedData = aesEncryptSync(dataWithHash, tmpAesKey, tmpAesIv);

  var request = new Serialization({ mtproto: true }, uid);

  log`onGb`('Send set_client_DH_params');
  request.storeMethod('set_client_DH_params', {
    nonce,
    server_nonce: serverNonce,
    encrypted_data: encryptedData
  });

  return request.writer.getBuffer();
};

function authKeysGen([response, authKey]) {
  var authKeyHash = sha1BytesSync(authKey);
  log`Got Set_client_DH_params_answer`(response._);
  return [response, {
    key: authKey,
    aux: authKeyHash.slice(0, 8),
    id: authKeyHash.slice(-8)
  }];
}

var dhChoose = (uid, url, auth) => ([response, keys]) =>
/*::joinChain(*/dhSwitch(uid, url, auth, response, keys); /*::)*/

function dhSwitch(uid, url, auth, response, keys) {
  switch (response._) {
    case 'dh_gen_ok':
      return (/*::joinChain(*/dhGenOk(response, keys, auth)
      ); /*::)*/
    case 'dh_gen_retry':
      return (/*::joinChain(*/dhGenRetry(uid, url, response, keys, auth)
      ); /*::)*/
    case 'dh_gen_fail':
      return (/*::joinChain(*/dhGenFail(response, keys, auth)
      ); /*::)*/
    default:
      return reject(new Error('Unknown case')); /*::.mapRej(dhAnswerFail)*/
  }
}

function dhGenOk(response, { key, id, aux }, { newNonce, serverNonce }) {
  var newNonceHash1 = sha1BytesSync(newNonce.concat([1], aux)).slice(-16);

  if (!bytesCmp(newNonceHash1, response.new_nonce_hash1)) {
    var err = reject(ERR.dh.nonce.hash1()); /*::.mapRej(dhAnswerFail)*/
    return err;
  }

  var serverSalt = bytesXor(newNonce.slice(0, 8), serverNonce.slice(0, 8));
  // console.log('Auth successfull!', authKeyID, authKey, serverSalt)


  var result = of({
    authKeyID: /*:: toCryptoKey(*/id /*::)*/
    , authKey: /*:: toCryptoKey(*/key /*::)*/
    , //eslint-disable-next-line
    serverSalt: /*:: toCryptoKey(*/serverSalt /*::)*/
  });
  return result;
}

function dhGenRetry(uid, url, response, { aux }, auth) {
  var { newNonce } = auth;
  var newNonceHash2 = sha1BytesSync(newNonce.concat([2], aux)).slice(-16);
  if (!bytesCmp(newNonceHash2, response.new_nonce_hash2)) {
    var err = reject(ERR.dh.nonce.hash2()); /*::.mapRej(dhAnswerFail)*/
    return err;
  }

  return authKeyFuture(uid, url)(auth);
}

function dhGenFail(response, { aux }, { newNonce }) {
  var newNonceHash3 = sha1BytesSync(newNonce.concat([3], aux)).slice(-16);
  if (!bytesCmp(newNonceHash3, response.new_nonce_hash3)) {
    var err = reject(ERR.dh.nonce.hash3()); /*::.mapRej(dhAnswerFail)*/
    return err;
  }
  var result = reject(ERR.dh.paramsFail()); /*::.mapRej(dhAnswerFail)*/
  return result;
}

var mtpSendReqDh = (uid, url) => auth => of(writeReqDH(uid, auth)).chain(sendPlainReq(uid, url)).map(fetchServerDh).chain(assertDhResponse(auth)).chain(decryptServerDH(uid, auth));

var decryptServerDH = (uid, auth) => ctx => decryptServerDHPlain(uid, makeAesKeys(auth), ctx);

function makeAesKeys(auth) {
  var { serverNonce, newNonce } = auth;
  var tmpAesKey = aesKey(serverNonce, newNonce);
  var tmpAesIv = aesIv(serverNonce, newNonce);

  return Object.assign({}, auth, { tmpAesKey, tmpAesIv });
}

function decryptServerDHPlain(uid, auth, response) {
  var { encrypted_answer: encryptedAnswer } = response;
  var { serverNonce, nonce, tmpAesKey, tmpAesIv } = auth;

  var answerWithHash = aesDecryptSync(encryptedAnswer, tmpAesKey, tmpAesIv);

  var hash = answerWithHash.slice(0, 20);
  var answerWithPadding = answerWithHash.slice(20);

  var deserializer = new Deserialization(bytesToArrayBuffer(answerWithPadding), { mtproto: true }, uid);

  return of(deserializer).map(fetchDHInner).chain(assertDecryption(nonce, serverNonce)).chain(mtpVerifyDhParams(deserializer, hash, answerWithPadding)).map(afterServerDhDecrypt(uid, auth));
}

var afterServerDhDecrypt = (uid, auth) => response => {
  log`DecryptServerDhDataAnswer`('Done decrypting answer');
  var {
    g,
    dh_prime: dhPrime,
    g_a: gA,
    server_time: serverTime
  } = response;
  var localTime = tsNow();
  applyServerTime(uid, serverTime, localTime);
  return Object.assign({}, auth, {
    g, gA,
    dhPrime,
    retry: 0
  });
};

function aesKey(serverNonce, newNonce) {
  var arr1 = [...newNonce, ...serverNonce];
  var arr2 = [...serverNonce, ...newNonce];
  var key1 = sha1BytesSync(arr1);
  var key2 = sha1BytesSync(arr2).slice(0, 12);
  return key1.concat(key2);
}

function aesIv(serverNonce, newNonce) {
  var arr1 = [...serverNonce, ...newNonce];
  var arr2 = [...newNonce, ...newNonce];
  var arr3 = newNonce.slice(0, 4);
  var key1 = sha1BytesSync(arr1);
  var key2 = sha1BytesSync(arr2);
  var res = key1.slice(12).concat(key2, arr3);
  return res;
}

var minSize = Math.ceil(64 / bpe) + 1;

var leemonTwoPow = (() => {
  //Dirty cheat to count 2^(2048 - 64)
  var arr = Array(496) //This number contains 496 zeroes in hex
  .fill('0');
  arr.unshift('1');
  var hex = arr.join('');
  var res = str2bigInt(hex, 16, minSize);
  return res;
})();

var innerLog = log`VerifyDhParams`;

var mtpVerifyDhParams = (deserializer, hash, answerWithPadding) => (response /*:: : Fluture<Server_DH_inner_data, *> */) => {

  var {
    g,
    dh_prime: dhPrime,
    g_a: gA
  } = response;
  innerLog('begin');
  var dhPrimeHex = bytesToHex(dhPrime);
  if (g !== 3 || dhPrimeHex !== primeHex)
    // The verified value is from https://core.telegram.org/mtproto/security_guidelines
    return reject(ERR.verify.unknownDhPrime()); /*::.mapRej(verifyFail)*/
  innerLog('dhPrime cmp OK');

  var dhPrimeLeemon = str2bigInt(dhPrimeHex, 16, minSize);
  var gALeemon = str2bigInt(bytesToHex(gA), 16, minSize);
  var dhDec = dup(dhPrimeLeemon);
  sub_(dhDec, one);
  var case1 = !greater(gALeemon, one);
  var case2 = !greater(dhDec, gALeemon);
  if (case1) return reject(ERR.verify.case1()); /*::.mapRej(verifyFail)*/

  if (case2) return reject(ERR.verify.case2()); /*::.mapRej(verifyFail)*/
  var case3 = !!greater(leemonTwoPow, gALeemon);
  var dhSubPow = dup(dhPrimeLeemon);
  sub(dhSubPow, leemonTwoPow);
  var case4 = !greater(dhSubPow, gALeemon);
  if (case3) return reject(ERR.verify.case3()); /*::.mapRej(verifyFail)*/
  if (case4) return reject(ERR.verify.case4()); /*::.mapRej(verifyFail)*/
  innerLog('2^{2048-64} < gA < dhPrime-2^{2048-64} OK');

  var offset = deserializer.getOffset();
  if (!bytesCmp(hash, sha1BytesSync(answerWithPadding.slice(0, offset)))) return reject(ERR.decrypt.sha1()); /*::.mapRej(decryptFail)*/

  return of(response); /*::.mapRej(verifyFail)*/
};

var assertDecryption = (nonce, serverNonce) => (response /*:: : Fluture<Server_DH_inner_data, *> */) => {
  if (response._ !== 'server_DH_inner_data') return reject(ERR.decrypt.response()); /*::.mapRej(decryptFail)*/

  if (!bytesCmp(nonce, response.nonce)) return reject(ERR.decrypt.nonce()); /*::.mapRej(decryptFail)*/

  if (!bytesCmp(serverNonce, response.server_nonce)) return reject(ERR.decrypt.serverNonce()); /*::.mapRej(decryptFail)*/
  return of(response); /*::.mapRej(decryptFail)*/
};

var assertDhParams = (nonce, serverNonce) => (response /*::: Fluture<Set_client_DH_params_answer, *> */) => {
  if (checkDhGen(response._)) {
    return reject(ERR.dh.responseInvalid(response._)); /*::.mapRej(assertFail)*/
  } else if (!bytesCmp(nonce, response.nonce)) {
    return reject(ERR.dh.nonce.mismatch()); /*::.mapRej(assertFail)*/
  } else if (!bytesCmp(serverNonce, response.server_nonce)) {
    return reject(ERR.dh.nonce.server()); /*::.mapRej(assertFail)*/
  }
  return of(response); /*::.mapRej(assertFail)*/
};

function checkDhGen(_) {
  return _ !== 'dh_gen_ok' && _ !== 'dh_gen_retry' && _ !== 'dh_gen_fail';
}

var assertDhResponse = ({ nonce, serverNonce, newNonce }) => (response /*:: : Fluture<*, *> */) => {
  if (response._ === 'server_DH_params_fail') {
    var newNonceHash = sha1BytesSync(newNonce).slice(-16);
    if (!bytesCmp(newNonceHash, response.new_nonce_hash)) {
      return reject(ERR.sendDH.hash()); /*::.mapRej(assertFail)*/
    }
    return reject(ERR.sendDH.fail()); /*::.mapRej(assertFail)*/
  }
  if (response._ !== 'server_DH_params_ok') {
    return reject(ERR.sendDH.invalid(response._)); /*::.mapRej(assertFail)*/
  }

  if (!bytesCmp(nonce, response.nonce)) {
    return reject(ERR.sendDH.nonce()); /*::.mapRej(assertFail)*/
  }

  if (!bytesCmp(serverNonce, response.server_nonce)) {
    return reject(ERR.sendDH.serverNonce()); /*::.mapRej(assertFail)*/
  }
  return of(response); /*::.mapRej(assertFail)*/
};

var ERR = {
  dh: {
    paramsFail: () => new Error('[MT] Set_client_DH_params_answer fail'),
    nonce: {
      mismatch: () => new Error('[MT] Set_client_DH_params_answer nonce mismatch'),
      server: () => new Error('[MT] Set_client_DH_params_answer server_nonce mismatch'),
      hash1: () => new Error('[MT] Set_client_DH_params_answer new_nonce_hash1 mismatch'),
      hash2: () => new Error('[MT] Set_client_DH_params_answer new_nonce_hash2 mismatch'),
      hash3: () => new Error('[MT] Set_client_DH_params_answer new_nonce_hash3 mismatch')
    },
    responseInvalid: _ => new Error(`[MT] Set_client_DH_params_answer response invalid: ${_}`)
  },
  verify: {
    unknownDhPrime: () => new Error('[MT] DH params are not verified: unknown dhPrime'),
    case1: () => new Error('[MT] DH params are not verified: gA <= 1'),
    case2: () => new Error('[MT] DH params are not verified: gA >= dhPrime - 1'),
    case3: () => new Error('[MT] DH params are not verified: gA < 2^{2048-64}'),
    case4: () => new Error('[MT] DH params are not verified: gA > dhPrime - 2^{2048-64}')
  },
  decrypt: {
    response: () => new Error(`[MT] server_DH_inner_data response invalid`),
    nonce: () => new Error('[MT] server_DH_inner_data nonce mismatch'),
    serverNonce: () => new Error('[MT] server_DH_inner_data serverNonce mismatch'),
    sha1: () => new Error('[MT] server_DH_inner_data SHA1-hash mismatch')
  },
  sendDH: {
    invalid: _ => new Error(`[MT] Server_DH_Params response invalid: ${_}`),
    nonce: () => new Error('[MT] Server_DH_Params nonce mismatch'),
    serverNonce: () => new Error('[MT] Server_DH_Params server_nonce mismatch'),
    hash: () => new Error('[MT] server_DH_params_fail new_nonce_hash mismatch'),
    fail: () => new Error('[MT] server_DH_params_fail')
  },
  sendPQ: {
    response: _ => new Error(`[MT] resPQ response invalid: ${_}`),
    nonce: () => new Error('[MT] resPQ nonce mismatch')
  }
};
//# sourceMappingURL=index.js.map