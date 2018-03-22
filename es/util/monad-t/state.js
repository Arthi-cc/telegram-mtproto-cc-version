import { ᐸMapᐳ, ᐸEmptyᐳ, λMap } from './index.h';

import Tuple from './tuple';

export class State {
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
    return new State(b => new Tuple(a, b));
  }

  static get() {
    return new State(s => new Tuple(s, s));
  }

  // static modify<-I, O>(f: (x: I) => O): State<null, O> {
  //   return new State((s: I): Tuple<null, O> => new Tuple(null, f(s)))
  // }

  static put(s) {
    return modify(no => s);
  }
}

// function ap<I, O, R, Name>(
//   s: State<((x: I) => State<O, R>), R>,
//   a: λMap<Name, I>
// ) {
//   return s.chain((f) => a.map(f))
// }

function of(a) {
  return new State(b => new Tuple(a, b));
}

var get = new State(s => new Tuple(s, s));

function modify(f) {
  return new State(s => new Tuple(null, f(s)));
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