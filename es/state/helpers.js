import { Stream } from 'most';
import { replace } from 'ramda';
import { createAction } from 'redux-act';
import { select } from 'redux-most';

var actionSelector = action => stream => select(action, stream);

export function doubleCreator(tag, meta) {
  var action = typeof meta === 'function' ? createAction(tag, x => x, meta) : createAction(tag);
  var stream = actionSelector(action.getType());
  Object.defineProperties(action, {
    stream: {
      value: stream,
      enumerable: false
    },
    type: {
      value: action.getType(),
      enumerable: false
    }
  });
  return action;
}

export var guardedReducer = (guards, reducer) => (state, payload) => {
  for (var i = 0, ln = guards.length; i < ln; i++) {
    var guard = guards[i];
    if (!guard(state, payload)) return state;
  }
  return reducer(state, payload);
};

export var trimType = replace(/\[\d+\]\s*/, '');
//# sourceMappingURL=helpers.js.map