'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.State = undefined;

var _index = require('./index.h');

var _tuple = require('./tuple');

var _tuple2 = _interopRequireDefault(_tuple);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class State {
  constructor(run) {
    this.run = run;
  }
  chain(f) {
    return new State(s => {
      var result = this.run(s);
      return f(result.fst()).run(result.snd());
    });
  }
  evalState(s) {
    return this.run(s).fst();
  }
  exec(s) {
    return this.run(s).snd();
  }
  map(f) {
    return this.chain(a => new State(f(a)));
  }
  // ap(a: *) {
  //   return this.chain((f) => a.map(f))
  // }

  static of(a) {
    return new State(b => new _tuple2.default(a, b));
  }

  static get() {
    return new State(s => new _tuple2.default(s, s));
  }

  // static modify<-I, O>(f: (x: I) => O): State<null, O> {
  //   return new State((s: I): Tuple<null, O> => new Tuple(null, f(s)))
  // }

  static put(s) {
    return modify(no => s);
  }
}

exports.State = State; // function ap<I, O, R, Name>(
//   s: State<((x: I) => State<O, R>), R>,
//   a: λMap<Name, I>
// ) {
//   return s.chain((f) => a.map(f))
// }

function of(a) {
  return new State(b => new _tuple2.default(a, b));
}

var get = new State(s => new _tuple2.default(s, s));

function modify(f) {
  return new State(s => new _tuple2.default(null, f(s)));
}

function put(s) {
  return modify(no => s);
}

// type Func<+M, T> = {
//   of<-I>(x: I): M,
//   map<-I, +O>(f: (x: I) => O, m: M): M,
// }
//
// class StateT<M> {
//
// }
//
// // Transformer
var StateT = M => {};
//# sourceMappingURL=state.js.map