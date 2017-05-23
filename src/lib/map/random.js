function runif(lo, hi) {
  return lo + Math.random() * (hi - lo);
}


let z2 = null;

export function rnorm() {
  if (z2 != null) {
    var tmp = z2;
    z2 = null;
    return tmp;
  }

  var x1 = 0;
  var x2 = 0;
  var w = 2.0;

  while (w >= 1) {
    x1 = runif(-1, 1);
    x2 = runif(-1, 1);
    w = x1 * x1 + x2 * x2;
  }

  w = Math.sqrt(-2 * Math.log(w) / w);
  z2 = x2 * w;
  return x1 * w;
}
