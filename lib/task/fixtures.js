'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isApiObject = isApiObject;
var initFlags = exports.initFlags = ({
  api = false,
  inner = false,
  container = false,
  incoming = true,
  methodResult = false,
  body = false,
  error = false
}) => ({
  api,
  inner,
  container,
  incoming,
  methodResult,
  body,
  error
});

function isApiObject(obj) {
  return typeof obj === 'object' && obj != null && typeof obj._ === 'string';
}
//# sourceMappingURL=fixtures.js.map