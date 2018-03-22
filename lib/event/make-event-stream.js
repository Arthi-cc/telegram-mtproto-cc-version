'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeEventStream = makeEventStream;

var _most = require('most');

function makeEventStream(emitter) {
  return function (name, casted) {
    var eventName = Array.isArray(name) ? name.join('.') : name;
    var eventStream = void 0;
    if (typeof casted === 'function') {
      eventStream = (0, _most.fromEvent)(eventName, emitter);
    } else {
      eventStream = (0, _most.fromEvent)(eventName, emitter);
    }
    return eventStream;
  };
}
//# sourceMappingURL=make-event-stream.js.map