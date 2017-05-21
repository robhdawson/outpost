// All points generated between -0.5 and 0.5, for a map
// with a width/height of 1. just multiple em to get other widths.

function randomPoints(amt) {
  const points = [];
  for (let i = 0; i < amt; i++) {
    points.push({
      x: (Math.random() - 0.5),
      y: (Math.random() - 0.5),
    });
  }

  return points;
};

export function generatePoints(amt) {
  const random = randomPoints(amt);

  return random;
}
