'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getState = exports.rootStream = exports.emitter = undefined;
exports.emitState = emitState;
exports.onDispatch = onDispatch;
exports.dispatch = dispatch;

var _eventemitter = require('eventemitter2');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _most = require('most');

require('./index.h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var emitter = exports.emitter = new _eventemitter2.default({
  wildcard: true
});

function emitState(state) {
  emitter.emit('state', state);
}

function onDispatch(dispatch) {
  emitter.on('dispatch', dispatch);
}

function dispatch(action, uid) {
  if (typeof uid !== 'string') {
    throw new TypeError(`uid must be string, got ${typeof uid} ${uid}`);
  }
  action.uid = uid;
  emitter.emit('dispatch', action);
}

var rootStream = exports.rootStream = (0, _most.fromEvent)('state', emitter).skipRepeats().multicast();

var currentState = void 0;

rootStream.observe(state => {
  currentState = state;
});

var getState = exports.getState = () => currentState;
//# sourceMappingURL=portal.js.map