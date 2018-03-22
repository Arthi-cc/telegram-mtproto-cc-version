'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MTProto;

var _fluture = require('fluture');

var _error = require('../../error');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _invoke = require('../invoke');

var _invoke2 = _interopRequireDefault(_invoke);

require('./index.h');

require('../../newtype.h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MTProto(config = {}) {
  var mtproto = new _index2.default(config);
  var uid = mtproto.uid;

  function telegram(method, params, options) {
    return (0, _invoke2.default)(uid, method, params, options).promise();
  }

  telegram.on = mtproto.on;
  telegram.emit = mtproto.emit;
  telegram.storage = mtproto.storage;
  telegram.uid = mtproto.uid;
  telegram.bus = mtproto.bus;
  telegram.mtproto = mtproto;
  telegram.future = function futureRequest(method, params, options) {
    return (0, _invoke2.default)(uid, method, params, options);
  };

  return telegram;
}
//# sourceMappingURL=wrap.js.map