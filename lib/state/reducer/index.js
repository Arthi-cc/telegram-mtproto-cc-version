'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _reduxAct = require('redux-act');

var _ramda = require('ramda');

var _helpers = require('../helpers');

var _newtype = require('../../newtype.h');

var _action = require('../action');

var _keyStorage = require('../../util/key-storage');

var _keyStorage2 = _interopRequireDefault(_keyStorage);

var _monadT = require('../../util/monad-t');

var _bin = require('../../bin');

var _netMessage = require('../../service/networker/net-message');

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _request3 = require('../../service/main/request');

var _request4 = _interopRequireDefault(_request3);

var _configProvider = require('../../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

require('../../task/index.h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable object-shorthand */

var initial = {};
// import { Pure, liftF } from '@safareli/free'
// import { of, Left, Right } from 'apropos'
// import { Maybe } from 'folktale/maybe'


function trimAction(action) {
  return (0, _helpers.trimType)(action.type);
}

var progress = (() => {

  var idle = (0, _reduxAct.createReducer)({}, []);
  var current = (0, _reduxAct.createReducer)({}, []);
  var done = (0, _reduxAct.createReducer)({}, []);
  var result = (0, _reduxAct.createReducer)({
    //$off
    [_action.API.TASK.DONE]: (state, payload) => {
      var apiPL = onlyAPI(payload);
      var newState = apiPL.reduce(reduceResults, state);
      return newState;
    }
  }, _monadT.KeyValue.empty());

  var reducer = (0, _redux.combineReducers)({
    idle,
    current,
    done,
    result
  });

  function reduceResults(acc, val) {
    var id = val.api.apiID;
    var data = val.body;
    var init = [];
    var list = acc.maybeGetK(id).fold(() => init, x => x.snd());
    var saved = (0, _ramda.append)(data, list);
    var res = acc.push([[id, saved]]);
    return res;
  }

  var findReq = id => req => req.requestID === id;
  var onlyAPI = units => units.filter(p => p.flags.api && p.api && p.api.resolved);
  var getReqIDs = list => list.map(req => req.requestID);

  function unitReduce({ idle, current, done, result }, unit) {
    var id = unit.api.apiID;
    var newIdle = idle;
    var newCurrent = current;
    var newDone = done;
    var find = findReq(id);
    var inIdle = newIdle.findIndex(find);
    var inCurrent = newCurrent.findIndex(find);
    if (inIdle > -1) {
      var _req = newIdle[inIdle];
      newIdle = (0, _ramda.remove)(inIdle, 1, newIdle);
      newDone = (0, _ramda.append)(_req, newDone);
    }
    if (inCurrent > -1) {
      var _req2 = newCurrent[inCurrent];
      newCurrent = (0, _ramda.remove)(inCurrent, 1, newCurrent);
      newDone = (0, _ramda.append)(_req2, newDone);
    }
    return {
      idle: newIdle,
      current: newCurrent,
      done: newDone,
      result
    };
  }

  return function watcher(currentState, action) {
    var state = reducer(currentState, action);
    var { idle, current, done, result } = state;
    switch (trimAction(action)) {
      case 'api/next':
        {
          if (idle.length === 0) return state;
          if (current.length > 0) return state;
          var newNext = (0, _ramda.head)(idle); /*:: || req */
          var newState = {
            idle: (0, _ramda.tail)(idle),
            current: (0, _ramda.append)(newNext, current),
            done,
            result
          };
          return newState;
        }
      case 'api/task new':
        {
          var ids = getReqIDs(idle).concat(getReqIDs(current));
          var payload = action.payload;
          console.log('task new payload: ', JSON.stringify(payload, null, 2));
          var update = payload.filter(req => !(0, _ramda.contains)(req.requestID, ids));
          var newIdle = idle.concat(update);
          return {
            idle: newIdle,
            current,
            done,
            result
          };
        }
      case 'api/task done':
        {
          var _payload = action.payload;
          var apiPL = onlyAPI(_payload);
          console.log('task done payload: ', JSON.stringify(_payload, null, 2));
          console.log('task done apiPL: ', JSON.stringify(apiPL, null, 2));
          var _newState = apiPL.reduce(unitReduce, state);
          console.log('task done _newState: ', JSON.stringify(_newState, null, 2));
          return _newState;
        }
      default:
        return state;
    }
  };
})();

var uid = (0, _reduxAct.createReducer)({
  //$FlowIssue
  [_action.MAIN.INIT]: (state, payload) => payload.uid
}, '');

var ackDefault = initial;
var pendingAck = (0, _reduxAct.createReducer)({
  //$off
  [_action.NET.ACK_ADD]: (state, { dc, ack }) => {
    var dcAcks = state[dc] || [];
    var updated = [...new Set([...dcAcks, ...ack])];
    return Object.assign({}, state, { [dc | 0]: updated });
  },
  //$off
  [_action.NET.ACK_DELETE]: (state, { dc, ack }) => {
    var dcAcks = state[dc] || [];
    var updated = (0, _ramda.without)(ack, dcAcks);
    return Object.assign({}, state, { [dc | 0]: updated });
  },
  //$off
  [_action.MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => Object.assign({}, state, {
    [halt]: []
  })
}, ackDefault);

var homeDc = (0, _reduxAct.createReducer)({
  //$off
  [_action.MAIN.STORAGE_IMPORTED]: (state, { home }) => home,
  //$off
  [_action.MAIN.DC_DETECTED]: (state, { dc }) => dc,
  //$FlowIssue
  [_action.MAIN.DC_CHANGED]: (state, { newDC }) => newDC
}, 2);

var dcDetected = (0, _reduxAct.createReducer)({
  //$off
  [_action.MAIN.DC_DETECTED]: () => true,
  //$off
  [_action.MAIN.DC_REJECTED]: () => false
}, false);

var lastMessages = (0, _reduxAct.createReducer)({
  //$off
  [_action.API.TASK.DONE]: (state, payload) => (0, _ramda.pipe)((0, _ramda.map)(unit => /*:: toUID( */unit.id /*:: ) */), (0, _ramda.concat)(state), (0, _ramda.takeLast)(100))(payload)
}, []);

var authData = (() => {
  var salt = (0, _reduxAct.createReducer)({
    //$off
    [_action.MAIN.AUTH.RESOLVE]: (state, payload) => state.set(payload.dc, payload.serverSalt),
    //$off
    [_action.MAIN.STORAGE_IMPORTED]: (state, { salt }) => state.merge(salt),
    '[01] action carrier': (state, payload) => state.merge(payload.summary.salt),
    //$off
    [_action.MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => state.remove(halt)
  }, (0, _keyStorage2.default)());

  var auth = (0, _reduxAct.createReducer)({
    //$off
    [_action.MAIN.STORAGE_IMPORTED]: (state, { auth }) => state.merge(auth),
    '[01] action carrier': (state, payload) => state.merge(payload.summary.auth),
    //$off
    [_action.MAIN.AUTH.RESOLVE]: (state, payload) => state.set(payload.dc, payload.authKey),
    //$off
    [_action.MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => state.remove(halt)
  }, (0, _keyStorage2.default)());

  var authID = (0, _reduxAct.createReducer)({
    //$off
    [_action.MAIN.STORAGE_IMPORTED]: (state, { auth }) => state.merge((0, _ramda.map)(makeAuthID, auth)),
    '[01] action carrier': (state, payload
    //$off
    ) => state.merge((0, _ramda.map)(makeAuthID, payload.summary.auth)),
    //$off
    [_action.MAIN.AUTH.RESOLVE]: (state, payload) => state.set(payload.dc, payload.authKeyID),
    //$off
    [_action.MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => state.remove(halt)
  }, (0, _keyStorage2.default)());

  var makeAuthID = auth => Array.isArray(auth) ? (0, _bin.sha1BytesSync)(auth).slice(-8) : false;

  return { auth, salt, authID };
})();

function commandReducer(state = _monadT.KeyValue.empty(), action) {
  switch ((0, _helpers.trimType)(action.type)) {
    case 'networker/sent add':
      {
        var payload = action.payload;
        var apiRequests = payload.filter(msg => msg.isAPI).map(({ msg_id, requestID }) => [msg_id, requestID || '']);
        return state.push(apiRequests);
      }
    case 'main/recovery mode':
      return state;
    default:
      return state;
  }
}

var clientRequest = (0, _reduxAct.createReducer)({
  //$off
  [_action.API.REQUEST.NEW]: (state, { netReq }) => state.push([[netReq.requestID, netReq]])
}, _monadT.KeyValue.empty());

var client = (0, _redux.combineReducers)(Object.assign({
  uid,
  homeDc,
  progress,
  command: commandReducer,
  request: clientRequest,
  lastMessages,
  dcDetected
}, authData, {
  pendingAck,
  status: (0, _reduxAct.createReducer)({}, {}),
  homeStatus: (0, _reduxAct.createReducer)({}, false)
}));

function statusWatch(state) {
  var dcList = _configProvider2.default.dcList(state.uid);
  var singleStatus = dc => state.auth.has(dc) && state.authID.has(dc) && state.salt.has(dc);
  var kv = _monadT.KeyValue.empty();
  return kv.push(dcList.map(dc => [dc, singleStatus(dc)]));
}

function decoratedClient(state, action) {
  var currentState = (0, _request2.default)(client(state, action), action);
  // console.log('currenState: ', currentState);
  var status = statusWatch(currentState);
  var homeStatus = status.maybeGetK(currentState.homeDc).fold(() => false, x => x.snd());
  return Object.assign({}, currentState, {
    status,
    homeStatus
  });
}

var clientReducer = (state = { ids: [] }, action) => {
  if (typeof action.uid !== 'string') return state;
  var uid = action.uid;
  var oldValue = state[uid];
  // console.log('oldValue: ', oldValue);
  var newValue = decoratedClient(oldValue, action);
  // console.log('newValue: ', newValue);
  if (oldValue === newValue) {
    // console.log('state: ', state);
    return state;
  }
  var result = Object.assign({}, state, {
    [uid]: newValue,
    ids: idsReducer(state.ids, uid)
  });
  console.log('result in clientReducer: ', result);
  return result;
};

function idsReducer(state, uid) {
  return (0, _ramda.contains)(uid, state) ? state : (0, _ramda.append)(uid, state);
}

var mainReducer = (0, _redux.combineReducers)({
  client: clientReducer
});

exports.default = mainReducer;
//# sourceMappingURL=index.js.map