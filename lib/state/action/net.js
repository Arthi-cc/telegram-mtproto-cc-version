'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NET = undefined;

var _helpers = require('../helpers');

require('../index.h');

var networkerMeta = (_, dc) => ({ _: 'networker', id: dc });

var NET = exports.NET = {
  SEND: (0, _helpers.doubleCreator)('net/send', networkerMeta),
  RECEIVE_RESPONSE: (0, _helpers.doubleCreator)('net/response'),
  NETWORK_ERROR: (0, _helpers.doubleCreator)('net/error'),
  SEQ_SET: (0, _helpers.doubleCreator)('net/seq set'),
  ACK_ADD: (0, _helpers.doubleCreator)('net/ack add'),
  ACK_DELETE: (0, _helpers.doubleCreator)('net/ack delete')
};
//# sourceMappingURL=net.js.map