function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import EventEmitter from 'eventemitter2';
import 'mtproto-shared';

import Config, { registerInstance } from '../../config-provider';
import '../../newtype.h';

import Logger from 'mtproto-logger';
var log = Logger`main`;

import streamBus from '../../event/stream-bus';
import { scopedEmitter } from '../../event';
import './index.h';
import { dispatch } from '../../state';
import { emitter } from '../../state/portal';
import { MAIN } from '../../state/action/main';
import loadStorage from './load-storage';
import { init } from './init';

class MTProto {
  constructor(config) {
    var _this = this;

    this.emitter = new EventEmitter({
      wildcard: true
    });
    this.on = this.emitter.on.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);
    this.defaultDC = 2;
    this.activated = true;

    emitter.emit('cleanup');
    var {
      uid,
      fullConfig,
      dcMap,
      storage,
      layer
    } = init(config);
    this.config = fullConfig;
    this.uid = uid;
    registerInstance({
      uid,
      emit: this.emit,
      rootEmitter: scopedEmitter(uid, this.emitter),
      schema: {
        apiSchema: fullConfig.schema,
        mtSchema: fullConfig.mtSchema
      },
      apiConfig: fullConfig.api,
      storage,
      layer,
      dcMap
    });
    this.storage = storage;
    this.emitter.on('*', (data, ...rest) => {
      log('event')(data);
      if (rest.length > 0) log('event', 'rest')(rest);
    });
    this.emitter.on('deactivate', () => {
      this.activated = false;
    });
    Config.publicKeys.init(uid, fullConfig.app.publicKeys);
    // this.api = new ApiManager(fullConfig, uid)
    this.bus = streamBus(this);
    dispatch(MAIN.INIT({
      uid
    }), uid);
    var load = (() => {
      var _ref = _asyncToGenerator(function* () {
        if (_this.activated) yield loadStorage(dcMap, uid);
      });

      return function load() {
        return _ref.apply(this, arguments);
      };
    })();
    this.load = load;
    setTimeout(load, 1e3);
  }
}

export default MTProto;
//# sourceMappingURL=index.js.map