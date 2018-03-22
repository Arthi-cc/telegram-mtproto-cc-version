import { doubleCreator } from '../helpers';
import '../index.h';

var networkerMeta = (_, dc) => ({ _: 'networker', id: dc });

export var NET = {
  SEND: doubleCreator('net/send', networkerMeta),
  RECEIVE_RESPONSE: doubleCreator('net/response'),
  NETWORK_ERROR: doubleCreator('net/error'),
  SEQ_SET: doubleCreator('net/seq set'),
  ACK_ADD: doubleCreator('net/ack add'),
  ACK_DELETE: doubleCreator('net/ack delete')
};
//# sourceMappingURL=net.js.map