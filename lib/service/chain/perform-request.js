'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeInnerMessage = writeInnerMessage;

var _netMessage = require('../networker/net-message');

var _typeBuffer = require('../../tl/type-buffer');

var _writer = require('../../tl/writer');

function writeInnerMessage({ writer, messages }) {
  var innerMessages = [];
  var noResponseMessages = [];
  messages.forEach((msg, i) => {
    (0, _writer.writeLong)(writer, msg.msg_id, `CONTAINER[${i}][msg_id]`);
    innerMessages.push(msg.msg_id);
    (0, _writer.writeInt)(writer, msg.seq_no, `CONTAINER[${i}][seq_no]`);
    (0, _writer.writeInt)(writer, msg.body.length, `CONTAINER[${i}][bytes]`);
    (0, _writer.writeIntBytes)(writer, msg.body, false);
    if (msg.noResponse) noResponseMessages.push(msg.msg_id);
  });

  return {
    innerMessages,
    noResponseMessages
  };
}
//# sourceMappingURL=perform-request.js.map