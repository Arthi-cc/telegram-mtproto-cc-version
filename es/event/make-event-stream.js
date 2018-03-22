import { fromEvent } from 'most';


export function makeEventStream(emitter) {
  return function (name, casted) {
    var eventName = Array.isArray(name) ? name.join('.') : name;
    var eventStream = void 0;
    if (typeof casted === 'function') {
      eventStream = fromEvent(eventName, emitter);
    } else {
      eventStream = fromEvent(eventName, emitter);
    }
    return eventStream;
  };
}
//# sourceMappingURL=make-event-stream.js.map