

/* eslint-disable no-underscore-dangle */

import { Tuple2 } from './tuple';

var Writer = M => {

  class ᐸWriterᐳ {
    constructor(run) {
      this.run = run;
    }
    chain(f) {
      return new ᐸWriterᐳ(() => {
        var result = this.run();
        var t = f(result._1).run();
        return new Tuple2(t._1, result._2.concat(t._2));
      });
    }

    tell(y) {
      return new ᐸWriterᐳ(() => {
        var result = this.run();
        return new Tuple2(null, result._2.concat(y));
      });
    }

    map(f) {
      return new ᐸWriterᐳ(() => {
        var result = this.run();
        return new Tuple2(f(result._1), result._2);
      });
    }

    ap(b) {
      return this.chain(a => b.map(a));
    }
  }

  return function of(x) {
    return new ᐸWriterᐳ(() => new Tuple2(x, M.empty()));
  };
};
//# sourceMappingURL=writer.js.map