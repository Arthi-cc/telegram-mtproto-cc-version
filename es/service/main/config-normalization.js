import MemoryStorage from '../../plugins/memory-storage';

import configValidator from './config-validation';
import generateInvokeLayer from './invoke-layer-generator';

import publisKeys from './public-keys';

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
      storage = new MemoryStorage(),
      publicKeys = publisKeys,
      plugins = []
    } = {},
    schema = api57,
    mtSchema = mtproto57
  } = config;
  var apiNormalized = Object.assign({}, apiConfig, api);
  var invokeLayer = generateInvokeLayer(apiNormalized.layer);
  apiNormalized.invokeWithLayer = invokeLayer;
  var fullCfg = {
    server,
    api: apiNormalized,
    app: { storage, publicKeys, plugins },
    schema,
    mtSchema
  };
  configValidator(fullCfg);
  return fullCfg;
};

export default configNormalization;
//# sourceMappingURL=config-normalization.js.map