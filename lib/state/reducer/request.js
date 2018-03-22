'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = requestWatch;

var _apropos = require('apropos');

var _helpers = require('../helpers');

var _newtype = require('../../newtype.h');

var _monadT = require('../../util/monad-t');

var _error = require('../../error');

var _request = require('../../service/main/request');

var _request2 = _interopRequireDefault(_request);

require('../../task/index.h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleApiResp(state, task, msgID, outID) {
  var { body } = task;

  var { command, request } = state;
  var result = command.maybeGetK(outID)
  /*:: .map(tuple => tuple.bimap(toUID, toUID)) */
  .chain(getRequestTuple(request)).map(x => x.bimap(removeMsgID(command, outID), req => {
    req.deferFinal.resolve(body);
    return request.removeK(req.requestID);
  })).fold(stateK(state), tupleToState(state));
  console.log('result: ', result);
  return result;
}
// import Config from 'ConfigProvider'

/* eslint-disable object-shorthand */

// import { Pure, liftF } from '@safareli/free'
// import { of, Left, Right } from 'apropos'
// import { Maybe } from 'folktale/maybe'


function handleError(state, task, msgID, outID) {
  console.log('task error: ', task);
  if (task.error.handled && task.error.code !== 420) {
    console.log('*************************************** task.error.handled state: ', state);
    return state;
  }
  var errorObj = new _error.RpcApiError(task.error.code, task.error.message);
  console.log('errorObj: ', errorObj);
  var { command, request } = state;
  var result = command.maybeGetK(outID)
  /*:: .map(tuple => tuple.bimap(toUID, toUID)) */
  .chain(getRequestTuple(request)).map(x => x.bimap(removeMsgID(command, outID), req => {
    req.deferFinal.reject(errorObj);
    return request.removeK(req.requestID);
  })).fold(stateK(state), tupleToState(state));
  console.log('*********************************************handle error result: ', result);
  return result;
}

var getRequestByID = request => reqID => request.maybeGetK(reqID).map(_monadT.TupleT.snd);

var removeMsgID = (command, outID) => msgID => command.removeK(msgID).removeK(outID);

var getRequestTuple = request => tuple => _monadT.TupleT.traverseMaybe(tuple.map(getRequestByID(request)));

var stateK = state => () => state;

var tupleToState = state => tuple => Object.assign({}, state, {
  command: tuple.fst(),
  request: tuple.snd()
});

function resolveTask(state, task) {
  console.log('task: ', task);
  var { flags } = task;
  var msgID = /*:: toUID( */task.id; /*:: ) */
  if (flags.api) {
    if (!task.api || !task.api.resolved) { 
      console.log('resolve task: api not resolved!!!!!');
    }
    // if(task.api && !task.api.resolved) {
    //   return handleError(state, task, msgID, outID);
    // }
    if (flags.methodResult) {
      var outID = /*:: toUID( */task.methodResult.outID; /*:: ) */
      if (flags.error) {
        console.log('request error: ', flags.error);
        return handleError(state, task, msgID, outID);
      } else if (flags.body) {
        console.log('request body: ', flags.body);
        return handleApiResp(state, task, msgID, outID);
      }
    }
  } else {
    return state;
  }
}

function requestWatch(state, action) {
  // console.log('requestWatch state: ', state);
  // console.log('requestWatch action: ', action);
  switch ((0, _helpers.trimType)(action.type)) {
    case 'api/task done':
      {
        var tasks = action.payload;
        console.log('request watch tasks: ', tasks);
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
        console.log('************************************************newState: ', newState);
        return newState;
      }
    default:
      return state;
  }
}
//# sourceMappingURL=request.js.map