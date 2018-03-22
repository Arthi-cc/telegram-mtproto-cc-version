import { cons, append, concatPair } from './prelude';

export default class Trampoline {
  run(x) {
    return applyStack(this.stack, x);
  }
  append(fn) {
    return new Trampoline(append(fn, this.stack));
  }
  prepend(fn) {
    return new Trampoline(cons(fn, this.stack));
  }
  concat(snd) {
    return Trampoline.concat(this, snd);
  }

  static concat(fst, snd) {
    return new Trampoline(concatPair(fst.stack, snd.stack));
  }
  static empty() {
    return new Trampoline([x => x]);
  }

  constructor(stack) {
    this.stack = stack;
  }
  static of(stack) {
    return new Trampoline(stack);
  }
}

export function applyStack(stack, data) {
  var ln = stack.length;
  if (ln === 0) return data;
  var current = data,
      fn = void 0,
      val = void 0;
  for (var i = 0; i < ln; ++i) {
    fn = stack[i];
    val = fn(current);
    current = val;
  }
  return current;
}
//# sourceMappingURL=trampoline.js.map