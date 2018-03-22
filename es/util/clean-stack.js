var extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/;
var pathRegex = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/babel-polyfill\/.*)?\w+)\.js:\d+:\d+)|native|<anonymous>)/;

var stackFilter = x => {
  var pathMatches = x.match(extractPathRegex);
  if (pathMatches == null || !pathMatches[1]) return true;
  return !pathRegex.test(pathMatches[1]);
};

var stackCleaner = stack => stack.replace(/\\/g, '/').split('\n').filter(stackFilter).filter(x => x.trim() !== '').join('\n');

export default stackCleaner;
//# sourceMappingURL=clean-stack.js.map