'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scopedEmitter = scopedEmitter;

var _eventemitter = require('eventemitter2');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _arrify = require('../util/arrify');

var _arrify2 = _interopRequireDefault(_arrify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ScopedEmitter {
  constructor(scope, parent) {
    this.on = (event, listener) => {
      var fullEvent = this.scope.concat(normalizeScope(event));
      return this.root.on(fullEvent, listener);
    };

    this.off = (event, listener) => {
      var fullEvent = [...this.scope, event].join('.');
      return this.root.off(fullEvent, listener);
    };

    this.emit = (event, ...values) => {
      var fullEvent = this.scope.concat(normalizeScope(event));
      return this.root.emit(fullEvent, ...values);
    };

    this.addEventListener = this.on;
    this.removeEventListener = this.off;

    if (parent instanceof ScopedEmitter) {
      this.root = parent.root;
      this.scope = combineScope(parent.scope, scope);
    } else {
      this.scope = normalizeScope(scope);
      this.root = parent;
    }
    /*:: return this */
  }

}

exports.default = ScopedEmitter;
function scopedEmitter(scope, parent) {
  return new ScopedEmitter(scope, parent);
}

var normalizeScope = scope => (0, _arrify2.default)(scope);

var reduceStarter = [];

var combineScope = (...scopes) => scopes.reduce((acc, val) => acc.concat(normalizeScope(val)), reduceStarter);
//# sourceMappingURL=scoped-emitter.js.map