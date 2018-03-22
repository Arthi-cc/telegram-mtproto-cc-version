import Bluebird from 'bluebird';

// export type Defer = $Shape<Bluebird.Defer>

var filler = value => {
  throw new Error(`Filler must not be called!`);
};

/**
 * Defered promise like in Q and $q
 */
export var blueDefer = () => {
  var resolve = filler,
      reject = filler;
  var promise = new Bluebird((rs, rj) => {
    resolve = rs;
    reject = rj;
  });
  return {
    resolve,
    reject,
    promise
  };
};

export default blueDefer;
//# sourceMappingURL=defer.js.map