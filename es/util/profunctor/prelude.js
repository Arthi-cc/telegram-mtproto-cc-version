

/**
 * cons :: a -> [a] -> [a]
 *
 * a with x prepended
 *
 * @export
 * @template T
 * @param {T} x
 * @param {T[]} a
 * @returns {T[]}
 */
export function cons(x, a) {
  var l = a.length;
  var b = new Array(l + 1);
  b[0] = x;
  for (var i = 0; i < l; ++i) {
    b[i + 1] = a[i];
  }
  return b;
}

/**
 * append :: a -> [a] -> [a]
 *
 * a with x appended
 *
 * @export
 * @template T
 * @param {T} x
 * @param {T[]} a
 * @returns {T[]}
 */
export function append(x, a) {
  var l = a.length;
  var b = new Array(l + 1);
  for (var i = 0; i < l; ++i) {
    b[i] = a[i];
  }
  b[l] = x;

  return b;
}

/**
 * drop :: Int -> [a] -> [a]
 *
 * drop first n elements
 *
 * @export
 * @template T
 * @param {number} n
 * @param {T[]} a
 * @returns {T[]}
 */
export function drop(n, a) {
  if (n < 0) {
    throw new TypeError('n must be >= 0');
  }

  var l = a.length;
  if (n === 0 || l === 0) {
    return a;
  }

  if (n >= l) {
    return [];
  }

  return unsafeDrop(n, a, l - n);
}

/**
 * unsafeDrop :: Int -> [a] -> Int -> [a]
 *
 * Internal helper for drop
 *
 * @template T
 * @param {number} n
 * @param {T[]} a
 * @param {number} l
 * @returns {T[]}
 */
function unsafeDrop(n, a, l) {
  var b = new Array(l);
  for (var i = 0; i < l; ++i) {
    b[i] = a[n + i];
  }
  return b;
}

/**
 * tail :: [a] -> [a]
 *
 * drop head element
 *
 * @export
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
export function tail(a) {
  return drop(1, a);
}

/**
 * copy :: [a] -> [a]
 *
 * duplicate a (shallow duplication)
 *
 * @export
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
export function copy(a) {
  var l = a.length;
  var b = new Array(l);
  for (var i = 0; i < l; ++i) {
    b[i] = a[i];
  }
  return b;
}

/**
 * concat :: [[a]] -> [a]
 *
 * @export
 * @template T
 * @param {T[][]} a
 * @returns {T[]}
 */
export function concat(a) {
  var lnMain = a.length;
  var lengthList = Array(lnMain);
  var lnTotal = 0,
      i = 0;
  for (; i < lnMain; ++i) {
    lnTotal += lengthList[i] = a[i].length;
  }
  var b = new Array(lnTotal);
  var index = 0,
      j = void 0,
      ln = void 0,
      list = void 0;
  for (i = 0; i < lnMain; ++i) {
    for (j = 0, ln = lengthList[i], list = a[i]; j < ln; ++j) {
      b[index++] = list[j];
    }
  }
  return b;
}

export function concatPair(a, b) {
  var lnA = a.length,
      lnB = b.length;
  var c = new Array(lnA + lnB);
  var i = 0 | 0;
  for (; i < lnA; ++i) {
    c[i] = a[i];
  }
  for (i = 0 | 0; i < lnB; ++i) {
    c[i + lnA] = b[i];
  }

  return c;
}

/**
 * reverse :: [a] -> [a]
 *
 * @export
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
export function reverse(a) {
  var l = a.length;

  var b = new Array(l);
  for (var i = 0; i < l; ++i) {
    b[i] = a[l - 1 - i];
  }
  return b;
}

/**
 * map :: (a -> b) -> [a] -> [b]
 * transform each element with f
 *
 * @export
 * @template T
 * @template S
 * @param {(val: T) => S} f
 * @param {T[]} a
 * @returns {S[]}
 */
export function map(f, a) {
  var l = a.length;
  var b = new Array(l);
  for (var i = 0; i < l; ++i) {
    b[i] = f(a[i]);
  }
  return b;
}

export function forEach(l, f, a) {
  var i = l;
  while (i--) {
    f(a[i]);
  }
}

function applyList(l, a, x) {
  var result = x;
  var currentFn = void 0;
  var current = x;
  for (var i = 0; i < l; ++i) {
    currentFn = a[i];
    //$FlowIssue
    result = currentFn(current);
    current = result;
  }
  //$FlowIssue
  return result;
}

function internalTransducer(fList, a, ln, fln) {
  var result = Array(ln);
  var current = void 0;
  for (var i = 0; i < ln; ++i) {
    current = a[i];
    result[i] = applyList(fln, fList, current);
  }
  return result;
}

//$FlowIssue
export function transducer(fList, a) {
  var ln = a.length;
  var fln = fList.length;
  if (ln === 0) return [];
  if (fln === 0) return copy(a);
  return internalTransducer(fList, a, ln, fln);
}

/**
 * reduce :: (a -> b -> a) -> a -> [b] -> a
 *
 * accumulate via left-fold
 *
 * @export
 * @template T
 * @template S
 * @param {(result: S, val: T, index: number) => S} f
 * @param {S} z
 * @param {T[]} a
 * @returns {S}
 */
export function reduce(f, z, a) {
  var r = z;
  for (var i = 0, l = a.length; i < l; ++i) {
    r = f(r, a[i], i);
  }
  return r;
}

/**
 * replace :: a -> Int -> [a]
 *
 * replace element at index
 *
 * @export
 * @template T
 * @param {T} x
 * @param {number} i
 * @param {T[]} a
 * @returns {T[]}
 */
export function replace(x, i, a) {
  if (i < 0) {
    throw new TypeError('i must be >= 0');
  }

  var l = a.length;
  var b = new Array(l);
  for (var j = 0; j < l; ++j) {
    b[j] = i === j ? x : a[j];
  }
  return b;
}

/**
 * remove :: Int -> [a] -> [a]
 *
 * remove element at index
 *
 *
 * @export
 * @template T
 * @param {number} i
 * @param {T[]} a
 * @returns
 */
export function remove(i, a) {
  if (i < 0) {
    throw new TypeError('i must be >= 0');
  }

  var l = a.length;
  if (l === 0 || i >= l) {
    // exit early if index beyond end of array
    return a;
  }

  if (l === 1) {
    // exit early if index in bounds and length === 1
    return [];
  }

  return unsafeRemove(i, a, l - 1);
}

/**
 * unsafeRemove :: Int -> [a] -> Int -> [a]
 *
 * Internal helper to remove element at index
 *
 *
 * @template T
 * @param {number} i
 * @param {T[]} a
 * @param {number} l
 * @returns {T[]}
 */
function unsafeRemove(i, a, l) {
  var b = new Array(l);
  var j = void 0;
  for (j = 0; j < i; ++j) {
    b[j] = a[j];
  }
  for (j = i; j < l; ++j) {
    b[j] = a[j + 1];
  }

  return b;
}

/**
 * removeAll :: (a -> boolean) -> [a] -> [a]
 *
 * remove all elements matching a predicate
 *
 * @export
 * @template T
 * @param {(val: T) => boolean} f
 * @param {T[]} a
 * @returns {T[]}
 */
export function removeAll(f, a) {
  var l = a.length;
  var b = new Array(l);
  var j = 0;
  for (var x, i = 0; i < l; ++i) {
    x = a[i];
    if (!f(x)) {
      b[j] = x;
      ++j;
    }
  }

  b.length = j;
  return b;
}

/**
 * findIndex :: a -> [a] -> Int
 * find index of x in a, from the left
 *
 *
 * @export
 * @template T
 * @param {number} x
 * @param {T[]} a
 * @returns {number}
 */
export function findIndex(x, a) {
  for (var i = 0, l = a.length; i < l; ++i) {
    if (x === a[i]) {
      return i;
    }
  }
  return -1;
}

/**
 * isArrayLike :: * -> boolean
 *
 * Return true if x is array-like
 *
 * @export
 * @param {mixed} x
 * @returns
 */
export function isArrayLike(x) {
  return x != null && typeof x.length === 'number' && typeof x !== 'function';
}

/* eslint-disable no-unused-vars */

/** The constant functions. */
export function K(a) {
  return b => a;
}

/* eslint-enable no-unused-vars */
//# sourceMappingURL=prelude.js.map