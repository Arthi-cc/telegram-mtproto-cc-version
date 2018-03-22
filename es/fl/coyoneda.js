

export class Coyoneda {
  constructor(f, val) {
    this.f = f;
    this.val = val;
  }
  map(f) {
    return new Coyoneda(x => f(this.f(x)), this.val);
  }
  lower() {
    return this.val.map(this.f);
  }
}

export function ᐸCoyonedaᐳlift(x) {
  return new Coyoneda(a => a, x);
}

// function Coyoneda(f, fa){ return new _Coyoneda(f, fa) }

// Coyoneda.lift = function(x){ return Coyoneda(id, x) }
//# sourceMappingURL=coyoneda.js.map