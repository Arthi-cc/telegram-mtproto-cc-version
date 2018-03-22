'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetContainer = exports.NetMessage = undefined;

var _timeManager = require('../time-manager');

var _defer = require('../../util/defer');

var _defer2 = _interopRequireDefault(_defer);

require('../../newtype.h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NetMessage {

  constructor(uid, dc, seq_no, body, type = 'other') {
    this.acked = false;
    this.container = false;
    this.notContentRelated = false;
    this.createNetworker = false;
    this.longPoll = false;

    this.copyHelper = (value, key) => {
      //$FlowIssue
      this[key] = value;
    };

    this.type = type;
    this.uid = uid;
    this.dc = dc;
    this.msg_id = (0, _timeManager.generateID)(uid);
    this.seq_no = seq_no;
    Object.defineProperty(this, 'body', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: body
    });
    Object.defineProperty(this, 'deferred', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: (0, _defer2.default)()
    });
    Object.defineProperty(this, 'copyHelper', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: this.copyHelper
    });
  }
  copyOptions(options) {
    //TODO remove this
    for (var _iterator = Object.entries(options), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var [key, val] = _ref;

      this.copyHelper(val, key);
    }
  }

  size() {
    if (this.body instanceof Uint8Array) return this.body.byteLength;else return this.body.length;
  }
  clone(seq_no, dc) {
    var copy = new NetMessage(this.uid, dc, seq_no, this.body, this.type);
    var result = clone(this, copy);
    return result;
  }
}

exports.NetMessage = NetMessage;
class NetContainer extends NetMessage {
  constructor(uid, dc, seq_no, body, inner, innerApi) {
    super(uid, dc, seq_no, body, 'container');
    this.container = true;
    this.inner = inner;
    this.innerAPI = innerApi;
  }
  clone(seq_no, dc) {
    var copy = new NetContainer(this.uid, dc, seq_no, this.body, this.inner, this.innerAPI /*:: || [] */);
    var result = clone(this, copy);
    return result;
  }
}

exports.NetContainer = NetContainer;
function clone(orig, copy) {
  copy.isAPI = orig.isAPI;
  copy.notContentRelated = orig.notContentRelated;
  copy.deferred = orig.deferred;
  copy.acked = orig.acked;
  copy.noShedule = orig.noShedule;
  copy.createNetworker = orig.createNetworker;
  copy.resultType = orig.resultType;
  return copy;
}
//# sourceMappingURL=net-message.js.map