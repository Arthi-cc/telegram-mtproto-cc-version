'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trimType = exports.guardedReducer = undefined;
exports.doubleCreator = doubleCreator;

var _most = require('most');

var _ramda = require('ramda');

var _reduxAct = require('redux-act');

var _reduxMost = require('redux-most');

var actionSelector = action => stream => (0, _reduxMost.select)(action, stream);

function doubleCreator(tag, meta) {
  var action = typeof meta === 'function' ? (0, _reduxAct.createAction)(tag, x => x, meta) : (0, _reduxAct.createAction)(tag);
  console.log('action in doubleCreator: ', action);
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

var guardedReducer = exports.guardedReducer = (guards, reducer) => (state, payload) => {
  for (var i = 0, ln = guards.length; i < ln; i++) {
    var guard = guards[i];
    if (!guard(state, payload)) return state;
  }
  return reducer(state, payload);
};

var trimType = exports.trimType = (0, _ramda.replace)(/\[\d+\]\s*/, '');
//# sourceMappingURL=helpers.js.map