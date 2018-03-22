'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

var _typeof = require('ajv-keywords/keywords/typeof');

var _typeof2 = _interopRequireDefault(_typeof);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schema = {
  properties: {
    app: require('../../../config-schema/app.json'),
    api: require('../../../config-schema/api.json'),
    server: require('../../../config-schema/server.json'),
    schema: { type: 'object' },
    mtSchema: { type: 'object' }
  },
  additionalProperties: false
};

var ajv = new _ajv2.default();
(0, _typeof2.default)(ajv);
var validate = ajv.compile(schema);

var configValidator = config => {
  var valid = validate(config);
  if (!valid) {
    console.log('config errors');
    validate.errors.map(printObj);
    throw new Error('wrong config fields');
  }
};

var printObj = arg => console.log(arg);

exports.default = configValidator;
//# sourceMappingURL=config-validation.js.map