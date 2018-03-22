"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function arrify(val) {
  if (val === null || val === undefined) {
    return [];
  }
  if (Array.isArray(val)) return val;else return [val];
}

exports.default = arrify;
//# sourceMappingURL=arrify.js.map