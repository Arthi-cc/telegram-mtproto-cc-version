function arrify(val) {
  if (val === null || val === undefined) {
    return [];
  }
  if (Array.isArray(val)) return val;else return [val];
}

export default arrify;
//# sourceMappingURL=arrify.js.map