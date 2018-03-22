'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _uuid = require('../../util/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

require('../../newtype.h');

require('./index.h');

var _configNormalization = require('./config-normalization');

var _configNormalization2 = _interopRequireDefault(_configNormalization);

var _dc = require('../../config-check/dc');

var _dc2 = _interopRequireDefault(_dc);

require('../../tl/index.h');

var _layout = require('../../layout');

var _layout2 = _interopRequireDefault(_layout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(config) {
  //$off
  var uid = (0, _uuid2.default)();
  var fullConfig = (0, _configNormalization2.default)(config);
  var dcMap = (0, _dc2.default)(config.server);
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
  apiLayer: new _layout2.default(api),
  mtLayer: new _layout2.default(mt)
});
//# sourceMappingURL=init.js.map