import uuid from '../../util/uuid';
import '../../newtype.h';
import './index.h';
import configNormalization from './config-normalization';
import parseServerConfig from '../../config-check/dc';
import '../../tl/index.h';
import Layout from '../../layout';

export function init(config) {
  //$off
  var uid = uuid();
  var fullConfig = configNormalization(config);
  var dcMap = parseServerConfig(config.server);
  var storage = fullConfig.app.storage;
  var layer = generateLayers(fullConfig.schema, fullConfig.mtSchema);

  return {
    uid,
    fullConfig,
    dcMap,
    storage,
    layer
  };
}

var generateLayers = (api, mt) => ({
  apiLayer: new Layout(api),
  mtLayer: new Layout(mt)
});
//# sourceMappingURL=init.js.map