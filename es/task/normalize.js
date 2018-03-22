import { Right } from 'apropos';

import './index.h';
import { toCryptoKey } from '../newtype.h';
import processing from './processing';
import Config from '../config-provider';

import mergePatch from './merge-patch';

import Logger from 'mtproto-logger';
var log = Logger`task-index`;

/*::
import { decrypt } from './decrypt'
declare var inp: RawInput
declare function wait<T>(data: Promise<T>): T
const decryptedData = wait(decrypt(inp).promise())

type NormalizeInput = typeof decryptedData
*/

export function normalize(ctx) {
  var flattenRaw = flattenMessage(ctx);
  var processed = processing(ctx, flattenRaw);
  return Object.assign({}, mergePatch(ctx, processed), ctx);
}

function flattenMessage(input) {
  var {
    messageID,
    seqNo,
    sessionID,
    response,
    uid,
    dc
  } = input;
  return Right(response).logic(checkContainer).fold(data => [{
    type: 'object',
    uid,
    id: messageID,
    seq: seqNo,
    session: /*:: toCryptoKey( */[...sessionID] /*:: ) */
    , dc,
    raw: data
  }], data => flattenContainer(input, data));
}

var checkContainer = {
  cond: response => response.messages != null && Array.isArray(response.messages),
  pass: response => response,
  fail: response => response
};

function flattenContainer(input, { messages }) {
  var {
    dc, uid, sessionID, messageID, seqNo
  } = input;
  var ids = messages.map(({ msg_id }) => msg_id);
  var session = Config.session.get(uid, dc);

  var normalizedMsgs = messages.map(msg => ({
    type: 'inner',
    id: msg.msg_id,
    seq: msg.seqno,
    session,
    dc,
    raw: msg
  }));
  return [...normalizedMsgs, {
    type: 'container',
    id: messageID,
    seq: seqNo,
    session,
    dc,
    raw: ids
  }];
}
//# sourceMappingURL=normalize.js.map