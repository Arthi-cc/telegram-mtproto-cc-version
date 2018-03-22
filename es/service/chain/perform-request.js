import { NetMessage } from '../networker/net-message';
import { TypeWriter } from '../../tl/type-buffer';
import { writeInt, writeIntBytes, writeLong } from '../../tl/writer';

export function writeInnerMessage({ writer, messages }) {
  var innerMessages = [];
  var noResponseMessages = [];
  messages.forEach((msg, i) => {
    writeLong(writer, msg.msg_id, `CONTAINER[${i}][msg_id]`);
    innerMessages.push(msg.msg_id);
    writeInt(writer, msg.seq_no, `CONTAINER[${i}][seq_no]`);
    writeInt(writer, msg.body.length, `CONTAINER[${i}][bytes]`);
    writeIntBytes(writer, msg.body, false);
    if (msg.noResponse) noResponseMessages.push(msg.msg_id);
  });

  return {
    innerMessages,
    noResponseMessages
  };
}
//# sourceMappingURL=perform-request.js.map