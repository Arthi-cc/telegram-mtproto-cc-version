'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.These = undefined;

var _apropos = require('apropos');

var _index = require('./index.h');

var { Just, Nothing } = _apropos.Maybe;

// import { Maybe, Just, Nothing } from 'folktale/maybe'


class TheseCore {
  map(f) {
    return this.bimap(x => x, f);
  }
  /*::
  bimap<Aʹ, Bʹ>(f: (x: A) => Aʹ, g: (y: B) => Bʹ): λThese<Aʹ, Bʹ> {
    declare var ret: λThese<Aʹ, Bʹ>
    return ret
  }
  */
}

class This extends TheseCore {
  /*:: +*/constructor(x) {
    super();
    this.x /*:: ; const xx*/ = x;
  }
  bimap(f /*::,
          g: (y: B) => Bʹ*/
  ) {
    return new This(f(this.x));
  }
  left() {
    return Just(this.x);
  }
  right() {
    return Nothing();
  }
  cata(obj) {
    var { This: fn } = obj;
    return (/*:: addTypes( */fn(this.x)
    ); /*:: ) */
  }
}

class That extends TheseCore {
  /*:: +*/constructor(y) {
    super();
    this.y /*:: ; const xx*/ = y;
  }
  bimap(f, g) {
    return new That(g(this.y));
  }
  left() {
    return Nothing();
  }
  right() {
    return Just(this.y);
  }
  cata(obj) {
    var { That: fn } = obj;
    return (/*:: addTypes( */fn(this.y)
    ); /*:: ) */
  }
}

class Both extends TheseCore {
  /*:: +*/constructor(x, y) {
    super();
    this.x /*:: ; const xx*/ = x;
    this.y /*:: ; const yy*/ = y;
  }
  /*:: +*/
  bimap(f, g) {
    return new Both(f(this.x), g(this.y));
  }
  left() {
    return Just(this.x);
  }
  right() {
    return Just(this.y);
  }
  cata(obj) {
    var { Both: fn } = obj;
    return (/*:: addTypes( */fn(this.x, this.y)
    ); /*:: ) */
  }
}

var typeID = 'zero-bias/These@1';

var These = exports.These = {
  '@@type': typeID,
  This(x) {
    return new This(x);
  },
  That(y) {
    return new That(y);
  },
  Both(x, y) {
    return new Both(x, y);
  },
  of(y) {
    return new That(y);
  },
  'fantasy-land/of': y => new That(y),
  thisOrBoth(x, y) {
    return y.fold(() => new This(x), b => new Both(x, b));
  },
  thatOrBoth(x, y) {
    return y.fold(() => new That(x), a => new Both(a, x));
  }
};

exports.default = These;

/*::
declare function concatA<A, B, +Aʹ>(x: λThese<A, B>): λThese<A | Aʹ, B>
declare function concatB<A, B, +Bʹ>(x: λThese<A, B>): λThese<A, B | Bʹ>
declare function changeA<-A, B, +Aʹ>(x: λThese<A, B>): λThese<Aʹ, B>
declare function changeB<A, -B, +Bʹ>(x: λThese<A, B>): λThese<A, Bʹ>
declare function addTypes<A, +B, +C>(x: A): A | B | C
*/
//# sourceMappingURL=these.js.map