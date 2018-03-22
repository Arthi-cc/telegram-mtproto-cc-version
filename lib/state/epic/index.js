'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reduxMost = require('redux-most');

var _most = require('most');

var _ramda = require('ramda');

require('../../newtype.h');

var _action = require('../action');

var _netRequest = require('./net-request');

var _netRequest2 = _interopRequireDefault(_netRequest);

var _task = require('./task');

var _invoke = require('../../service/invoke');

var _query = require('../query');

var _portal = require('../portal');

var _monadT = require('../../util/monad-t');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Config from 'ConfigProvider'

var filterActions = list => action => (0, _ramda.contains)((0, _helpers.trimType)(action.type), list);

var Blackhole = {
  //$off
  action(state, action) {
    var { homeDc, status } = state;
    status.toJSON();

    var type = (0, _helpers.trimType)(action.type);

    switch (type) {
      case 'api/request new':
        {
          (0, _portal.dispatch)(_action.API.TASK.NEW([action.payload.netReq]), action.uid);
          break;
        }
      case 'main/auth resolve':
        {
          (0, _portal.dispatch)(_action.API.TASK.NEW(state.request.values), action.uid);
          break;
        }
      case 'main/dc detected':
        {
          var _uid = action.payload.uid;
          var dc = action.payload.dc;
          var homeStatus = (0, _query.getHomeStatus)(_uid);
          var keys = (0, _query.queryKeys)(_uid, dc).map(({ dc, uid, auth, authID, salt }) => ({
            dc, uid,
            authKey: auth,
            authKeyID: authID,
            serverSalt: salt
          })).fold(() => false, x => x);
          if (homeStatus && keys) {
            (0, _portal.dispatch)(_action.MAIN.AUTH.RESOLVE(keys), _uid);
          } else {
            (0, _invoke.authRequest)(_uid, dc).promise();
          }
        }
    }
  }
};

var onEvent = action => action.filter(e => !!e.uid).map(e => (0, _query.getClient)(e.uid).map(state => Blackhole.action(state, e))).filter(() => false);

var onMessageTrigger = action => action.filter(e => !!e.uid).filter(filterActions(['api/request new', 'main/auth resolve', 'api/task new', 'api/task done'])).map(({ uid }) => uid).filter(_query.getHomeStatus).map(uid => (0, _portal.dispatch)(_action.API.NEXT({ uid }), uid)).filter(() => false);

var afterStorageImport = action => action.thru(_action.MAIN.STORAGE_IMPORTED.stream).map(e => e.payload).map(({ home, uid }) => ({ dc: home, uid })).map(_action.MAIN.DC_DETECTED);

var rootEpic = (0, _reduxMost.combineEpics)([afterStorageImport, onMessageTrigger, _netRequest2.default, _task.receiveResponse, onEvent, _netRequest.onNewTask]);

exports.default = rootEpic;
//# sourceMappingURL=index.js.map