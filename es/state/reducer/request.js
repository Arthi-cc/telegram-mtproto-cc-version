

/* eslint-disable object-shorthand */

// import { Pure, liftF } from '@safareli/free'
// import { of, Left, Right } from 'apropos'
// import { Maybe } from 'folktale/maybe'
import { Maybe } from 'apropos';

import { trimType } from '../helpers';
import { toUID } from '../../newtype.h';
import { KeyValue, TupleT } from '../../util/monad-t';
import { RpcApiError } from '../../error';
import ApiRequest from '../../service/main/request';
// import Config from 'ConfigProvider'

import '../../task/index.h';

function handleApiResp(state, task, msgID, outID) {
  var { body } = task;

  var { command, request } = state;
  return command.maybeGetK(outID)
  /*:: .map(tuple => tuple.bimap(toUID, toUID)) */
  .chain(getRequestTuple(request)).map(x => x.bimap(removeMsgID(command, outID), req => {
    req.deferFinal.resolve(body);
    return request.removeK(req.requestID);
  })).fold(stateK(state), tupleToState(state));
}

function handleError(state, task, msgID, outID) {
  if (task.error.handled) return state;
  var errorObj = new RpcApiError(task.error.code, task.error.message);
  var { command, request } = state;
  return command.maybeGetK(outID)
  /*:: .map(tuple => tuple.bimap(toUID, toUID)) */
  .chain(getRequestTuple(request)).map(x => x.bimap(removeMsgID(command, outID), req => {
    req.deferFinal.reject(errorObj);
    return request.removeK(req.requestID);
  })).fold(stateK(state), tupleToState(state));
}

var getRequestByID = request => reqID => request.maybeGetK(reqID).map(TupleT.snd);

var removeMsgID = (command, outID) => msgID => command.removeK(msgID).removeK(outID);

var getRequestTuple = request => tuple => TupleT.traverseMaybe(tuple.map(getRequestByID(request)));

var stateK = state => () => state;

var tupleToState = state => tuple => Object.assign({}, state, {
  command: tuple.fst(),
  request: tuple.snd()
});

function resolveTask(state, task) {
  var { flags } = task;
  var msgID = /*:: toUID( */task.id; /*:: ) */
  if (flags.api) {
    if (!task.api || !task.api.resolved) {}
    if (flags.methodResult) {
      var outID = /*:: toUID( */task.methodResult.outID; /*:: ) */
      if (flags.error) {
        return handleError(state, task, msgID, outID);
      } else if (flags.body) {
        return handleApiResp(state, task, msgID, outID);
      }
    }
  }
  return state;
}

export default function requestWatch(state, action) {
  switch (trimType(action.type)) {
    case 'api/task done':
      {
        var tasks = action.payload;
        var newState = state;
        for (var _iterator = tasks, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
          }

          var task = _ref;

          newState = resolveTask(newState, task);
        }
        return newState;
      }
    default:
      return state;
  }
}
//# sourceMappingURL=request.js.map