import { from } from 'most';
import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-most';
import Logger from 'mtproto-logger';
var log = Logger`redux-core`;

import { isNode } from '../runtime';

import './index.h';
import rootReducer from './reducer';
import rootEpic from './epic';
import { skipEmptyMiddleware, normalizeActions, tryAddUid } from './middleware';
import { emitState, onDispatch } from './portal';

var composeEnhancers = compose;

if (isNode === false && typeof window === 'object') composeEnhancers =
//eslint-disable-next-line
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


function configureStore(rootReducer, initialState) {
  var epicMiddleware = createEpicMiddleware(rootEpic);
  var enhancers = composeEnhancers(applyMiddleware(normalizeActions({ meta: {} }), tryAddUid, skipEmptyMiddleware, epicMiddleware));

  //$FlowIssue
  var store = createStore(rootReducer, initialState, enhancers);

  return store;
}

var store = configureStore(rootReducer, {});

onDispatch(store.dispatch);

var rootStream = from(store).multicast();

rootStream.observe(emitState);

export default store;
//# sourceMappingURL=core.js.map