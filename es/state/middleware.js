import 'redux';
import { replace, trim, pipe } from 'ramda';
import Logger from 'mtproto-logger';
var log = Logger`redux-core`;

export var tryAddUid = () => next => action => {
  if (typeof action !== 'object' || action == null) return;
  if (typeof action.uid === 'string') return (() => next(action))();
  if (typeof action.payload === 'object' && action.payload != null && typeof action.payload.uid === 'string') action.uid = action.payload.uid;
  return next(action);
};

export var skipEmptyMiddleware = () => next => action => {
  if (getActionType(action) === 'networker/sent delete' && Array.isArray(action.payload) && action.payload.length === 0) //TODO Remove hardcode
    log`skip empty`(action.type);else return next(action);
};

/*::
declare var actionObject: ActionObject
declare var dataArray: Array<any>
const actionArray = { ...actionObject, payload: dataArray }

type ActionArray = typeof actionArray
*/

var removeTypeIndex = replace(/\[\d+\] /, '');

var getActionType = pipe(e => e.type || '', removeTypeIndex, trim);

export var normalizeActions = defaults => () => next => action => next(Object.assign({}, defaults, action));
//# sourceMappingURL=middleware.js.map