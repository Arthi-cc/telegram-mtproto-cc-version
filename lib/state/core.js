'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _most = require('most');

var _redux = require('redux');

var _reduxMost = require('redux-most');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

var _runtime = require('../runtime');

require('./index.h');

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _epic = require('./epic');

var _epic2 = _interopRequireDefault(_epic);

var _middleware = require('./middleware');

var _portal = require('./portal');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`redux-core`;

var composeEnhancers = _redux.compose;

if (_runtime.isNode === false && typeof window === 'object') composeEnhancers =
//eslint-disable-next-line
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || _redux.compose;


function configureStore(rootReducer, initialState) {
  var epicMiddleware = (0, _reduxMost.createEpicMiddleware)(_epic2.default);
  var enhancers = composeEnhancers((0, _redux.applyMiddleware)((0, _middleware.normalizeActions)({ meta: {} }), _middleware.tryAddUid, _middleware.skipEmptyMiddleware, epicMiddleware));

  //$FlowIssue
  var store = (0, _redux.createStore)(rootReducer, initialState, enhancers);

  return store;
}

var store = configureStore(_reducer2.default, {});

(0, _portal.onDispatch)(store.dispatch);

var rootStream = (0, _most.from)(store).multicast();

rootStream.observe(_portal.emitState);

exports.default = store;
//# sourceMappingURL=core.js.map