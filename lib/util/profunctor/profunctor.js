'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _prelude = require('./prelude');

var _arrow = require('./arrow');

var _arrow2 = _interopRequireDefault(_arrow);

var _trampoline = require('./trampoline');

var _trampoline2 = _interopRequireDefault(_trampoline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Basically, this is a pair of functions:
 * *before* transformation and *after*
 *
 * Transformation is any function from `A` to `B`
 *
 * @class Profunctor
 * @template A Transformation input
 * @template B Transformation output
 * @template I Main input
 * @template O Results output
 */
class Profunctor {
  before() {
    if (this.λ.pre === undefined) {
      this.λ.pre = _arrow2.default.of(this.pre);
    }
    return this.λ.pre;
  }
  after() {
    if (this.λ.post === undefined) {
      this.λ.post = _arrow2.default.of(this.post);
    }
    return this.λ.post;
  }
  /**
   * Turns a Profunctor around
   *
   * @returns {Profunctor<O, I, B, A>}
   * @memberof Profunctor
   */
  inverse() {
    return new Profunctor(this.post, this.pre);
  }

  /**
   * *Extends* a Profunctor by prepending
   *  new function *before* and appending *after*
   *
   * @param {ArrowType<I1, I>} pre
   * @param {ArrowType<O, O1>} post
   * @template I1
   * @template O1
   * @memberof Profunctor
   * @returns {Profunctor<A, B, I1, O1>}
   */
  promap(pre, post) {
    return new Profunctor((0, _prelude.concatPair)(ofArrow(pre), this.pre), (0, _prelude.concatPair)(this.post, ofArrow(post)));
  }

  /**
   * *Change* a Profunctor by wrapping
   *  new type into transformation
   *
   * @param {ArrowType<A, A1>} pre
   * @param {ArrowType<B1, B>} post
   * @template A1
   * @template B1
   * @memberof Profunctor
   * @returns {Profunctor<A1, B1, I, O>}
   */
  bimap(pre, post) {
    return new Profunctor((0, _prelude.concatPair)(this.pre, ofArrow(pre)), (0, _prelude.concatPair)(ofArrow(post), this.post));
  }

  ap(fn) {
    var fnStack = ofArrow(fn);
    var fullStack = (0, _prelude.concat)([this.pre, fnStack, this.post]);
    return _arrow2.default.of(fullStack);
  }

  constructor(pre, post) {
    this.pre = pre;
    this.post = post;
    //$FlowIssue
    Object.defineProperty(this, 'λ', {
      value: {},
      enumerable: false,
      writable: true
    });
  }
  static of(pre, post) {
    return new Profunctor(ofArrow(pre), ofArrow(post));
  }
}

exports.default = Profunctor;
function ofArrow(val) {
  if (val instanceof _arrow2.default) {
    return val.λ.stack;
  } else if (typeof val === 'function') {
    return [val];
  } else if (Array.isArray(val)) {
    return val;
  } else if (val instanceof _trampoline2.default) {
    return val.stack;
  } else throw new TypeError(`wrong arrow-like`);
}

/**
 * Like standart Profunctor, but with reduce inside
 *
 * @class Costar
 * @extends {Profunctor<A[], B[], I, O>}
 * @template A
 * @template B
 * @template I
 * @template O
 */
/*export class Costar<A, B, AL: A[], BL: B[], I, O> extends Profunctor<AL, BL, I, O> {
  reduce<Fn: ArrowType<A, B>>(fn: Fn): Arrow<I, O> {
    const arrow: Arrow<A, B> = Arrow.of(fn)
    const reducer = (acc: B[], val: A) => append(arrow.ap(val), acc)
    function reduceFn(source: AL): BL {
      const empty: BL = ([]: any)
      return source.reduce(reducer, empty)
    }
    const reduceArrow: Arrow<AL, BL> = Arrow.of(reduceFn)
    return this.pre
      .compose(reduceArrow)
      .compose(this.post)
  }

  static of<
    A1, B1, AL1: A1[], BL1: B1[], I1, O1,
    Pre: ArrowType<I1, A1[]>,
    Post: ArrowType<B1[], O1>
  >(pre: Pre, post: Post): Costar<A1, B1, AL1, BL1, I1, O1> {
    //$ FlowIssue
    return new Costar(Arrow.of(pre), Arrow.of(post))
  }
}*/
//# sourceMappingURL=profunctor.js.map