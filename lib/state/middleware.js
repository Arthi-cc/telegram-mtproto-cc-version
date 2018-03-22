'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeActions = exports.skipEmptyMiddleware = exports.tryAddUid = undefined;

require('redux');

var _ramda = require('ramda');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _mtprotoLogger2.default`redux-core`;
var tryAddUid = exports.tryAddUid = () => next => action => {
  if (typeof action !== 'object' || action == null) return;
  if (typeof action.uid === 'string') return (() => next(action))();
  if (typeof action.payload === 'object' && action.payload != null && typeof action.payload.uid === 'string') action.uid = action.payload.uid;
  return next(action);
};

var skipEmptyMiddleware = exports.skipEmptyMiddleware = () => next => action => {
  if (getActionType(action) === 'networker/sent delete' && Array.isArray(action.payload) && action.payload.length === 0) //TODO Remove hardcode
    log`skip empty`(action.type);else return next(action);
};

/*::
declare var actionObject: ActionObject
declare var dataArray: Array<any>
const actionArray = { ...actionObject, payload: dataArray }

type ActionArray = typeof actionArray
*/

var removeTypeIndex = (0, _ramda.replace)(/\[\d+\] /, '');

var getActionType = (0, _ramda.pipe)(e => e.type || '', removeTypeIndex, _ramda.trim);

var normalizeActions = exports.normalizeActions = defaults => () => next => action => next(Object.assign({}, defaults, action));
//# sourceMappingURL=middleware.js.map