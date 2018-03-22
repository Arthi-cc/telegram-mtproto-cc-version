'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchResPQ = exports.fetchServerDh = exports.fetchDhParam = exports.fetchDHInner = undefined;
exports.writeReqPQ = writeReqPQ;
exports.writeReqDH = writeReqDH;
exports.writeInnerDH = writeInnerDH;

var _tl = require('../../tl');

var _bin = require('../../bin');

require('./index.h');

require('../main/index.h');

var fetchDHInner = exports.fetchDHInner = (reader
//$off
) => reader.fetchObject('Server_DH_inner_data', 'server_dh');

var fetchDhParam = exports.fetchDhParam = (reader
//$off
) => reader.fetchObject('Set_client_DH_params_answer', 'client_dh');

var fetchServerDh = exports.fetchServerDh = (reader
//$off
) => reader.fetchObject('Server_DH_Params', 'RESPONSE');

var fetchResPQ = exports.fetchResPQ = (reader
//$off
) => reader.fetchObject('ResPQ', 'ResPQ');

function writeReqPQ(uid, nonce) {
  var request = new _tl.Serialization({ mtproto: true }, uid);
  request.storeMethod('req_pq', { nonce });
  return request.writer.getBuffer();
}

function writeReqDH(uid, auth) {
  var {
    nonce,
    serverNonce,
    publicKey,
    pq,
    p,
    q,
    newNonce
  } = auth;
  var data = new _tl.Serialization({ mtproto: true }, uid);
  data.storeObject({
    _: 'p_q_inner_data',
    pq,
    p,
    q,
    nonce,
    server_nonce: serverNonce,
    new_nonce: newNonce
  }, 'P_Q_inner_data', 'DECRYPTED_DATA');

  var hash = data.getBytesPlain();
  var dataWithHash = (0, _bin.sha1BytesSync)(data.writer.getBuffer()).concat(hash);

  var request = new _tl.Serialization({ mtproto: true }, uid);
  request.storeMethod('req_DH_params', {
    nonce,
    server_nonce: serverNonce,
    p,
    q,
    public_key_fingerprint: publicKey.fingerprint,
    encrypted_data: (0, _bin.rsaEncrypt)(publicKey, dataWithHash)
  });
  return request.writer.getBuffer();
}

function writeInnerDH(uid, auth, gB) {
  var {
    nonce,
    serverNonce
  } = auth;
  var data = new _tl.Serialization({ mtproto: true }, uid);

  data.storeObject({
    _: 'client_DH_inner_data',
    nonce,
    server_nonce: serverNonce,
    retry_id: [0, auth.retry++],
    g_b: gB
  }, 'Client_DH_Inner_Data', 'client_DH');

  var hash = data.getBytesPlain();
  return (0, _bin.sha1BytesSync)(data.writer.getBuffer()).concat(hash);
}
//# sourceMappingURL=fetch-object.js.map