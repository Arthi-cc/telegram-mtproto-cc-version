'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventemitter = require('eventemitter2');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

require('mtproto-shared');

var _configProvider = require('../../config-provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

require('../../newtype.h');

var _mtprotoLogger = require('mtproto-logger');

var _mtprotoLogger2 = _interopRequireDefault(_mtprotoLogger);

var _streamBus = require('../../event/stream-bus');

var _streamBus2 = _interopRequireDefault(_streamBus);

var _event = require('../../event');

require('./index.h');

var _state = require('../../state');

var _portal = require('../../state/portal');

var _main = require('../../state/action/main');

var _loadStorage = require('./load-storage');

var _loadStorage2 = _interopRequireDefault(_loadStorage);

var _init = require('./init');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = _mtprotoLogger2.default`main`;

class MTProto {
  constructor(config) {
    var _this = this;

    this.emitter = new _eventemitter2.default({
      wildcard: true
    });
    this.on = this.emitter.on.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);
    this.defaultDC = 2;
    this.activated = true;

    _portal.emitter.emit('cleanup');
    var {
      uid,
      fullConfig,
      dcMap,
      storage,
      layer
    } = (0, _init.init)(config);
    this.config = fullConfig;
    this.uid = uid;
    (0, _configProvider.registerInstance)({
      uid,
      emit: this.emit,
      rootEmitter: (0, _event.scopedEmitter)(uid, this.emitter),
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
    _configProvider2.default.publicKeys.init(uid, fullConfig.app.publicKeys);
    // this.api = new ApiManager(fullConfig, uid)
    this.bus = (0, _streamBus2.default)(this);
    (0, _state.dispatch)(_main.MAIN.INIT({
      uid
    }), uid);
    var load = (() => {
      var _ref = _asyncToGenerator(function* () {
        if (_this.activated) yield (0, _loadStorage2.default)(dcMap, uid);
      });

      return function load() {
        return _ref.apply(this, arguments);
      };
    })();
    this.load = load;
    setTimeout(load, 1e3);
  }
}

exports.default = MTProto;
//# sourceMappingURL=index.js.map