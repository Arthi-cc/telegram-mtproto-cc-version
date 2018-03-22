"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class OnlyStatic {
  constructor() {
    throw new Error(`Created instance of only static class`);
  }
}

exports.OnlyStatic = OnlyStatic;
exports.default = OnlyStatic;
//# sourceMappingURL=only-static.js.map