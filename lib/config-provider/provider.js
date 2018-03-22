'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;
exports.registerInstance = registerInstance;

var _fluture = require('fluture');

require('eventemitter2');

require('mtproto-shared');

var _error = require('../error');

require('../tl/index.h');

require('../newtype.h');

require('../service/main/index.h');

var _scopedEmitter = require('../event/scoped-emitter');

var _scopedEmitter2 = _interopRequireDefault(_scopedEmitter);

var _networker = require('../service/networker');

var _networker2 = _interopRequireDefault(_networker);

var _layout = require('../layout');

var _layout2 = _interopRequireDefault(_layout);

var _l1Cache = require('../l1-cache');

var _l1Cache2 = _interopRequireDefault(_l1Cache);

var _storageAdapter = require('../storage-adapter');

var _storageAdapter2 = _interopRequireDefault(_storageAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var provider = {};

function getConfig(uid) {
  var config = provider[uid];
  if (config == null) throw new _error.ProviderRegistryError(uid);
  return config;
}

function registerInstance(config) {
  var fullConfig = Object.assign({}, config, {
    keyManager: keyManagerNotInited,
    //$off
    storageAdapter: new _storageAdapter2.default(config.storage),
    timerOffset: 0,
    seq: {},
    session: {},
    fastCache: {},
    thread: {},
    authRequest: {},
    halt: {},
    publicKeys: {},
    lastMessageID: [0, 0]
  });
  provider[fullConfig.uid] = fullConfig;
}

function keyManagerNotInited() {
  throw new Error(`Key manager not inited`);
}
//# sourceMappingURL=provider.js.map