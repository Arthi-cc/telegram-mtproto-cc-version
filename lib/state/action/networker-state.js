'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NETWORKER_STATE = undefined;

var _helpers = require('../helpers');

var networkerMeta = (_, dc) => ({ _: 'networker', id: dc });

/*::import { NetMessage } from '../../service/networker/net-message'*/
var NETWORKER_STATE = exports.NETWORKER_STATE = {
  RESEND: {
    ADD: (0, _helpers.doubleCreator)('networker/resend add', networkerMeta),
    DEL: (0, _helpers.doubleCreator)('networker/resend delete', networkerMeta)
  },
  SENT: {
    ADD: (0, _helpers.doubleCreator)('networker/sent add', networkerMeta),
    DEL: (0, _helpers.doubleCreator)('networker/sent delete', networkerMeta)
  },
  PENDING: {
    ADD: (0, _helpers.doubleCreator)('networker/pending add', networkerMeta),
    DEL: (0, _helpers.doubleCreator)('networker/pending delete', networkerMeta)
  }
};
//# sourceMappingURL=networker-state.js.map