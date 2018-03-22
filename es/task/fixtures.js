export var initFlags = ({
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

export function isApiObject(obj) {
  return typeof obj === 'object' && obj != null && typeof obj._ === 'string';
}
//# sourceMappingURL=fixtures.js.map