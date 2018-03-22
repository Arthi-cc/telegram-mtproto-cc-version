'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mtprotoShared = require('mtproto-shared');

var _tasks = require('./tasks');

var _tasks2 = _interopRequireDefault(_tasks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CryptoBin = () => ({
  factorize: (0, _mtprotoShared.immediateWrap)(_tasks2.default.factorize),
  modPow: (0, _mtprotoShared.immediateWrap)(_tasks2.default.modPow),
  sha1Hash: (0, _mtprotoShared.immediateWrap)(_tasks2.default.sha1Hash),
  aesEncrypt: (0, _mtprotoShared.immediateWrap)(_tasks2.default.aesEncrypt),
  aesDecrypt: (0, _mtprotoShared.immediateWrap)(_tasks2.default.aesDecrypt)
});

exports.default = CryptoBin;
//# sourceMappingURL=crypto-bin.js.map