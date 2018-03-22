

/*::import { NetMessage } from '../../service/networker/net-message'*/
import { doubleCreator } from '../helpers';

var networkerMeta = (_, dc) => ({ _: 'networker', id: dc });

export var NETWORKER_STATE = {
  RESEND: {
    ADD: doubleCreator('networker/resend add', networkerMeta),
    DEL: doubleCreator('networker/resend delete', networkerMeta)
  },
  SENT: {
    ADD: doubleCreator('networker/sent add', networkerMeta),
    DEL: doubleCreator('networker/sent delete', networkerMeta)
  },
  PENDING: {
    ADD: doubleCreator('networker/pending add', networkerMeta),
    DEL: doubleCreator('networker/pending delete', networkerMeta)
  }
};
//# sourceMappingURL=networker-state.js.map