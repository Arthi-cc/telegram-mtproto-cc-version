import { combineEpics } from 'redux-most';
import { Stream } from 'most';
import { contains } from 'ramda';
import '../../newtype.h';
import { MAIN, API } from '../action';
import netRequest, { onNewTask } from './net-request';
import { receiveResponse } from './task';
import { authRequest } from '../../service/invoke';
import { getClient, getHomeStatus, queryKeys } from '../query';

import { dispatch } from '../portal';
import { KeyValue } from '../../util/monad-t';
import { trimType } from '../helpers';
// import Config from 'ConfigProvider'

var filterActions = list => action => contains(trimType(action.type), list);

var Blackhole = {
  //$off
  action(state, action) {
    var { homeDc, status } = state;
    status.toJSON();

    var type = trimType(action.type);

    switch (type) {
      case 'api/request new':
        {
          dispatch(API.TASK.NEW([action.payload.netReq]), action.uid);
          break;
        }
      case 'main/auth resolve':
        {
          dispatch(API.TASK.NEW(state.request.values), action.uid);
          break;
        }
      case 'main/dc detected':
        {
          var _uid = action.payload.uid;
          var dc = action.payload.dc;
          var homeStatus = getHomeStatus(_uid);
          var keys = queryKeys(_uid, dc).map(({ dc, uid, auth, authID, salt }) => ({
            dc, uid,
            authKey: auth,
            authKeyID: authID,
            serverSalt: salt
          })).fold(() => false, x => x);
          if (homeStatus && keys) {
            dispatch(MAIN.AUTH.RESOLVE(keys), _uid);
          } else {
            authRequest(_uid, dc).promise();
          }
        }
    }
  }
};

var onEvent = action => action.filter(e => !!e.uid).map(e => getClient(e.uid).map(state => Blackhole.action(state, e))).filter(() => false);

var onMessageTrigger = action => action.filter(e => !!e.uid).filter(filterActions(['api/request new', 'main/auth resolve', 'api/task new', 'api/task done'])).map(({ uid }) => uid).filter(getHomeStatus).map(uid => dispatch(API.NEXT({ uid }), uid)).filter(() => false);

var afterStorageImport = action => action.thru(MAIN.STORAGE_IMPORTED.stream).map(e => e.payload).map(({ home, uid }) => ({ dc: home, uid })).map(MAIN.DC_DETECTED);

var rootEpic = combineEpics([afterStorageImport, onMessageTrigger, netRequest, receiveResponse, onEvent, onNewTask]);

export default rootEpic;
//# sourceMappingURL=index.js.map