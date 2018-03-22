export class RequestCache {
  constructor(timeout) {
    this.cache = new Set();

    this.remove = val => {
      this.cache.delete(val);
    };

    this.timeout = timeout;
  }

  add(val) {
    this.cache.add(val);
    setTimeout(this.remove, this.timeout, val);
  }
  has(val) {
    if (this.cache.has(val)) return true;
    this.add(val);
    return false;
  }
}

export default function filter(selector, timeout) {
  var cache = new RequestCache(timeout);
  return data => !cache.has(selector(data));
}
//# sourceMappingURL=request-cache.js.map