'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _memoryStorage = require('../../plugins/memory-storage');

var _memoryStorage2 = _interopRequireDefault(_memoryStorage);

var _configValidation = require('./config-validation');

var _configValidation2 = _interopRequireDefault(_configValidation);

var _invokeLayerGenerator = require('./invoke-layer-generator');

var _invokeLayerGenerator2 = _interopRequireDefault(_invokeLayerGenerator);

var _publicKeys = require('./public-keys');

var _publicKeys2 = _interopRequireDefault(_publicKeys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var api57 = require('../../../schema/api-57.json');
var mtproto57 = require('../../../schema/mtproto-57.json');

var apiConfig = {
  invokeWithLayer: 0xda9b0d0d,
  layer: 57,
  initConnection: 0x69796de9,
  api_id: 49631,
  device_model: 'Unknown UserAgent',
  system_version: 'Unknown Platform',
  app_version: '1.0.1',
  lang_code: 'en'
};

var configNormalization = config => {
  var {
    server = {},
    api = {},
    app: {
      storage = new _memoryStorage2.default(),
      publicKeys = _publicKeys2.default,
      plugins = []
    } = {},
    schema = api57,
    mtSchema = mtproto57
  } = config;
  var apiNormalized = Object.assign({}, apiConfig, api);
  var invokeLayer = (0, _invokeLayerGenerator2.default)(apiNormalized.layer);
  apiNormalized.invokeWithLayer = invokeLayer;
  var fullCfg = {
    server,
    api: apiNormalized,
    app: { storage, publicKeys, plugins },
    schema,
    mtSchema
  };
  (0, _configValidation2.default)(fullCfg);
  return fullCfg;
};

exports.default = configNormalization;
//# sourceMappingURL=config-normalization.js.map