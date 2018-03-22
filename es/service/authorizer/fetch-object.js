import { Deserialization as Reader, Serialization as Writer } from '../../tl';
import { rsaEncrypt, sha1BytesSync } from '../../bin';

import './index.h';
import '../main/index.h';

export var fetchDHInner = (reader
//$off
) => reader.fetchObject('Server_DH_inner_data', 'server_dh');

export var fetchDhParam = (reader
//$off
) => reader.fetchObject('Set_client_DH_params_answer', 'client_dh');

export var fetchServerDh = (reader
//$off
) => reader.fetchObject('Server_DH_Params', 'RESPONSE');

export var fetchResPQ = (reader
//$off
) => reader.fetchObject('ResPQ', 'ResPQ');

export function writeReqPQ(uid, nonce) {
  var request = new Writer({ mtproto: true }, uid);
  request.storeMethod('req_pq', { nonce });
  return request.writer.getBuffer();
}

export function writeReqDH(uid, auth) {
  var {
    nonce,
    serverNonce,
    publicKey,
    pq,
    p,
    q,
    newNonce
  } = auth;
  var data = new Writer({ mtproto: true }, uid);
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
  var dataWithHash = sha1BytesSync(data.writer.getBuffer()).concat(hash);

  var request = new Writer({ mtproto: true }, uid);
  request.storeMethod('req_DH_params', {
    nonce,
    server_nonce: serverNonce,
    p,
    q,
    public_key_fingerprint: publicKey.fingerprint,
    encrypted_data: rsaEncrypt(publicKey, dataWithHash)
  });
  return request.writer.getBuffer();
}

export function writeInnerDH(uid, auth, gB) {
  var {
    nonce,
    serverNonce
  } = auth;
  var data = new Writer({ mtproto: true }, uid);

  data.storeObject({
    _: 'client_DH_inner_data',
    nonce,
    server_nonce: serverNonce,
    retry_id: [0, auth.retry++],
    g_b: gB
  }, 'Client_DH_Inner_Data', 'client_DH');

  var hash = data.getBytesPlain();
  return sha1BytesSync(data.writer.getBuffer()).concat(hash);
}
//# sourceMappingURL=fetch-object.js.map