function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import 'mtproto-shared';
// import { fromNullable, Maybe, Just, Nothing } from 'folktale/maybe'

import { Maybe } from 'apropos';
var { fromNullable, Just, Nothing } = Maybe;

export default class StorageAdapter {
  constructor(storage) {
    this.storage = storage;
  }
  getAuthKey(dc) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var data = yield _this.storage.get(`dc${String(dc)}_auth_key`);
      return fromNullable(data).chain(validateArray);
    })();
  }
  getSalt(dc) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var data = yield _this2.storage.get(`dc${String(dc)}_server_salt`);
      return fromNullable(data).chain(validateArray);
    })();
  }
  getAuthID(dc) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      var data = yield _this3.storage.get(`dc${String(dc)}_auth_id`);
      return fromNullable(data).chain(validateArray);
    })();
  }
  getNearestDC() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var data = yield _this4.storage.get(`nearest_dc`);
      return fromNullable(data).chain(validateNumber);
    })();
  }
  getDC() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      var data = yield _this5.storage.get(`dc`);
      return fromNullable(data).chain(validateNumber);
    })();
  }

  setAuthKey(dc, data) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6.storage.set(`dc${String(dc)}_auth_key`, data);
    })();
  }
  setSalt(dc, data) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      yield _this7.storage.set(`dc${String(dc)}_server_salt`, data);
    })();
  }
  setAuthID(dc, data) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      yield _this8.storage.set(`dc${String(dc)}_auth_id`, data);
    })();
  }
  setNearestDC(dc) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      yield _this9.storage.set(`nearest_dc`, dc);
    })();
  }
  setDC(dc) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      yield _this10.storage.set(`dc`, dc);
    })();
  }

  removeAuthKey(dc) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      yield _this11.storage.remove(`dc${String(dc)}_auth_key`);
    })();
  }
  removeSalt(dc) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      yield _this12.storage.remove(`dc${String(dc)}_server_salt`);
    })();
  }
  removeAuthID(dc) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      yield _this13.storage.remove(`dc${String(dc)}_auth_id`);
    })();
  }
  removeNearestDC() {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      yield _this14.storage.remove(`nearest_dc`);
    })();
  }
  removeDC() {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      yield _this15.storage.remove(`dc`);
    })();
  }
}

function validateArray(data) {
  if (Array.isArray(data)) {
    if (data.every(n => typeof n === 'number')) {
      return Just(data);
    }
  }
  return Nothing();
}

function validateNumber(data) {
  if (typeof data === 'number') return Just(data);
  if (typeof data === 'string') {
    if (isFinite(data)) {
      var num = parseInt(data, 10);
      if (num > 0) return Just(num);
    }
  }
  return Nothing();
}
//# sourceMappingURL=storage-adapter.js.map