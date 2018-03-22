import EventEmitter from 'eventemitter2';
import arrify from '../util/arrify';

export default class ScopedEmitter {
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

export function scopedEmitter(scope, parent) {
  return new ScopedEmitter(scope, parent);
}

var normalizeScope = scope => arrify(scope);

var reduceStarter = [];

var combineScope = (...scopes) => scopes.reduce((acc, val) => acc.concat(normalizeScope(val)), reduceStarter);
//# sourceMappingURL=scoped-emitter.js.map