'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestNextSeq = requestNextSeq;

var _configProvider = require('../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function requestNextSeq(uid, dc, notContentRelated) {
  var currentSeq = _configProvider2.default.seq.get(uid, dc);

  var seqNo = currentSeq * 2;
  var nextSeq = currentSeq;
  if (!notContentRelated) {
    seqNo++;
    nextSeq++;
  }

  _configProvider2.default.seq.set(uid, dc, nextSeq);
  // dispatch(NET.SEQ_SET({ dc, seq: nextSeq }), uid)
  return seqNo;
}
//# sourceMappingURL=reaction.js.map