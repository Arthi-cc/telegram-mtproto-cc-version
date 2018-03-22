function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import { trim, fromPairs } from 'ramda';

// import dcStoreKeys from 'Util/dc-store-keys'
import Config from '../../config-provider';

import { dispatch } from '../../state';
import random from '../secure-random';
import { MAIN } from '../../state/action';
import { bytesFromHex } from '../../bin';
import Thread from '../networker';

import { toDCNumber } from '../../newtype.h';

export default (() => {
  var _ref = _asyncToGenerator(function* (dcMap, uid) {
    var iAuth = {};
    var iSalt = {};
    var iHome = 2;

    var getter = Config.storageAdapter.get;

    for (var _iterator = dcMap.keys(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var _dc = _ref2;

      var fields = {
        authKey: [],
        salt: [],
        session: []
      };
      var salt = yield getter.salt(uid, _dc).then(function (val) {
        return val.fold(function () {
          return false;
        }, function (x) {
          return x;
        });
      });
      // const salt = checkString(saltRaw)
      if (Array.isArray(salt)) {
        iSalt = Object.assign({}, iSalt, { [_dc | 0]: salt });
        fields = Object.assign({}, fields, {
          salt
        });
      }
      var auth = yield getter.authKey(uid, _dc).then(function (val) {
        return val.fold(function () {
          return false;
        }, function (x) {
          return x;
        });
      });
      if (Array.isArray(auth)) {
        iAuth = Object.assign({}, iAuth, { [_dc | 0]: auth });

        var saltKey = Array.isArray(salt) ? salt : getDefaultSalt();

        iSalt = Object.assign({}, iSalt, { [_dc | 0]: saltKey });
        new Thread(_dc, uid);
        fields = Object.assign({}, fields, {
          salt: saltKey,
          authKey: auth
        });
      }
    }
    //$off
    var nearest = yield getter.nearestDC(uid).then(function (val) {
      return val
      /*:: .map(toDCNumber) */
      .fold(function () {
        return false;
      }, function (x) {
        return x;
      });
    });
    if (nearest !== false) {
      iHome = nearest;
      // dispatch(MAIN.DC_DETECTED(nearest))
    } //else
    // dispatch(MAIN.MODULE_LOADED())
    // dispatch(MAIN.DC_DETECTED(2))
    var session = createSessions(getDcList(iAuth, iSalt, iHome));
    var finalAction = {
      auth: iAuth,
      salt: iSalt,
      home: iHome,
      uid,
      session
    };
    dispatch(MAIN.STORAGE_IMPORTED(finalAction), uid);
  });

  return function loadStorage(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var getDefaultSalt = () => bytesFromHex('AAAAAAAAAAAAAAAA');

function getDcList(auth, salt, home) {
  var dcList = [].concat(Object.keys(auth), Object.keys(salt), [home]).filter(isFinite).map(e => parseInt(e, 10));
  return [...new Set(dcList)];
}

//$off
var createSessions = dcList => fromPairs(dcList.map(dc => [dc, random(new Array(8))]));
//# sourceMappingURL=load-storage.js.map