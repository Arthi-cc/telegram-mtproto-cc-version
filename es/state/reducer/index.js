

/* eslint-disable object-shorthand */

import { combineReducers } from 'redux';
import { createReducer } from 'redux-act';
import { append, contains, without, map, takeLast, pipe, concat, tail, head, remove } from 'ramda';
// import { Pure, liftF } from '@safareli/free'
// import { of, Left, Right } from 'apropos'
// import { Maybe } from 'folktale/maybe'

import { trimType } from '../helpers';
import { toUID } from '../../newtype.h';
import { MAIN, NET, API } from '../action';
import keyStorage, { KeyStorage } from '../../util/key-storage';
import { KeyValue } from '../../util/monad-t';
import { sha1BytesSync } from '../../bin';
import { NetMessage } from '../../service/networker/net-message';
import requestWatch from './request';
import ApiRequest from '../../service/main/request';
import Config from '../../config-provider';

import '../../task/index.h';

var initial = {};

function trimAction(action) {
  return trimType(action.type);
}

var progress = (() => {

  var idle = createReducer({}, []);
  var current = createReducer({}, []);
  var done = createReducer({}, []);
  var result = createReducer({
    //$off
    [API.TASK.DONE]: (state, payload) => {
      var apiPL = onlyAPI(payload);
      var newState = apiPL.reduce(reduceResults, state);
      return newState;
    }
  }, KeyValue.empty());

  var reducer = combineReducers({
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
    var saved = append(data, list);
    var res = acc.push([[id, saved]]);
    return res;
  }

  var findReq = id => req => req.requestID === id;
  var onlyAPI = units => units.filter(p => p.flags.api && p.api.resolved);
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
      newIdle = remove(inIdle, 1, newIdle);
      newDone = append(_req, newDone);
    }
    if (inCurrent > -1) {
      var _req2 = newCurrent[inCurrent];
      newCurrent = remove(inCurrent, 1, newCurrent);
      newDone = append(_req2, newDone);
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
          var newNext = head(idle); /*:: || req */
          var newState = {
            idle: tail(idle),
            current: append(newNext, current),
            done,
            result
          };
          return newState;
        }
      case 'api/task new':
        {
          var ids = getReqIDs(idle).concat(getReqIDs(current));
          var payload = action.payload;
          var update = payload.filter(req => !contains(req.requestID, ids));
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
          var _newState = apiPL.reduce(unitReduce, state);
          return _newState;
        }
      default:
        return state;
    }
  };
})();

var uid = createReducer({
  //$FlowIssue
  [MAIN.INIT]: (state, payload) => payload.uid
}, '');

var ackDefault = initial;
var pendingAck = createReducer({
  //$off
  [NET.ACK_ADD]: (state, { dc, ack }) => {
    var dcAcks = state[dc] || [];
    var updated = [...new Set([...dcAcks, ...ack])];
    return Object.assign({}, state, { [dc | 0]: updated });
  },
  //$off
  [NET.ACK_DELETE]: (state, { dc, ack }) => {
    var dcAcks = state[dc] || [];
    var updated = without(ack, dcAcks);
    return Object.assign({}, state, { [dc | 0]: updated });
  },
  //$off
  [MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => Object.assign({}, state, {
    [halt]: []
  })
}, ackDefault);

var homeDc = createReducer({
  //$off
  [MAIN.STORAGE_IMPORTED]: (state, { home }) => home,
  //$off
  [MAIN.DC_DETECTED]: (state, { dc }) => dc,
  //$FlowIssue
  [MAIN.DC_CHANGED]: (state, { newDC }) => newDC
}, 2);

var dcDetected = createReducer({
  //$off
  [MAIN.DC_DETECTED]: () => true,
  //$off
  [MAIN.DC_REJECTED]: () => false
}, false);

var lastMessages = createReducer({
  //$off
  [API.TASK.DONE]: (state, payload) => pipe(map(unit => /*:: toUID( */unit.id /*:: ) */), concat(state), takeLast(100))(payload)
}, []);

var authData = (() => {
  var salt = createReducer({
    //$off
    [MAIN.AUTH.RESOLVE]: (state, payload) => state.set(payload.dc, payload.serverSalt),
    //$off
    [MAIN.STORAGE_IMPORTED]: (state, { salt }) => state.merge(salt),
    '[01] action carrier': (state, payload) => state.merge(payload.summary.salt),
    //$off
    [MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => state.remove(halt)
  }, keyStorage());

  var auth = createReducer({
    //$off
    [MAIN.STORAGE_IMPORTED]: (state, { auth }) => state.merge(auth),
    '[01] action carrier': (state, payload) => state.merge(payload.summary.auth),
    //$off
    [MAIN.AUTH.RESOLVE]: (state, payload) => state.set(payload.dc, payload.authKey),
    //$off
    [MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => state.remove(halt)
  }, keyStorage());

  var authID = createReducer({
    //$off
    [MAIN.STORAGE_IMPORTED]: (state, { auth }) => state.merge(map(makeAuthID, auth)),
    '[01] action carrier': (state, payload
    //$off
    ) => state.merge(map(makeAuthID, payload.summary.auth)),
    //$off
    [MAIN.AUTH.RESOLVE]: (state, payload) => state.set(payload.dc, payload.authKeyID),
    //$off
    [MAIN.RECOVERY_MODE]: (state, { halt, recovery }) => state.remove(halt)
  }, keyStorage());

  var makeAuthID = auth => Array.isArray(auth) ? sha1BytesSync(auth).slice(-8) : false;

  return { auth, salt, authID };
})();

function commandReducer(state = KeyValue.empty(), action) {
  switch (trimType(action.type)) {
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

var clientRequest = createReducer({
  //$off
  [API.REQUEST.NEW]: (state, { netReq }) => state.push([[netReq.requestID, netReq]])
}, KeyValue.empty());

var client = combineReducers(Object.assign({
  uid,
  homeDc,
  progress,
  command: commandReducer,
  request: clientRequest,
  lastMessages,
  dcDetected
}, authData, {
  pendingAck,
  status: createReducer({}, {}),
  homeStatus: createReducer({}, false)
}));

function statusWatch(state) {
  var dcList = Config.dcList(state.uid);
  var singleStatus = dc => state.auth.has(dc) && state.authID.has(dc) && state.salt.has(dc);
  var kv = KeyValue.empty();
  return kv.push(dcList.map(dc => [dc, singleStatus(dc)]));
}

function decoratedClient(state, action) {
  var currentState = requestWatch(client(state, action), action);
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
  var newValue = decoratedClient(oldValue, action);
  if (oldValue === newValue) return state;
  return Object.assign({}, state, {
    [uid]: newValue,
    ids: idsReducer(state.ids, uid)
  });
};

function idsReducer(state, uid) {
  return contains(uid, state) ? state : append(uid, state);
}

var mainReducer = combineReducers({
  client: clientReducer
});

export default mainReducer;
//# sourceMappingURL=index.js.map