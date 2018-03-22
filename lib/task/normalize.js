'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalize = normalize;

var _apropos = require('apropos');

require('./index.h');

var _newtype = require('../newtype.h');

var _processing = require('./processing');

var _processing2 = _interopRequireDefault(_processing);

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

var _mergePatch = require('./merge-patch');

var _mergePatch2 = _interopRequireDefault(_mergePatch);

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`task-index`;

/*::
import { decrypt } from './decrypt'
declare var inp: RawInput
declare function wait<T>(data: Promise<T>): T
const decryptedData = wait(decrypt(inp).promise())

type NormalizeInput = typeof decryptedData
*/

function normalize(ctx) {
  var flattenRaw = flattenMessage(ctx);
  var processed = (0, _processing2.default)(ctx, flattenRaw);
  return Object.assign({}, (0, _mergePatch2.default)(ctx, processed), ctx);
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
  return (0, _apropos.Right)(response).logic(checkContainer).fold(data => [{
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
  var session = _configProvider2.default.session.get(uid, dc);

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