import Emitter from 'eventemitter2';
import { fromEvent, Stream } from 'most';

import './index.h';

export var emitter = new Emitter({
  wildcard: true
});

export function emitState(state) {
  emitter.emit('state', state);
}

export function onDispatch(dispatch) {
  emitter.on('dispatch', dispatch);
}

export function dispatch(action, uid) {
  if (typeof uid !== 'string') {
    throw new TypeError(`uid must be string, got ${typeof uid} ${uid}`);
  }
  action.uid = uid;
  emitter.emit('dispatch', action);
}

export var rootStream = fromEvent('state', emitter).skipRepeats().multicast();

var currentState = void 0;

rootStream.observe(state => {
  currentState = state;
});

export var getState = () => currentState;
//# sourceMappingURL=portal.js.map