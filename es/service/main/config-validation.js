import Ajv from 'ajv';
import AjvKeys from 'ajv-keywords/keywords/typeof';

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

var ajv = new Ajv();
AjvKeys(ajv);
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

export default configValidator;
//# sourceMappingURL=config-validation.js.map