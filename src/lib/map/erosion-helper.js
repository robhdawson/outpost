const epsilon = 0.00001;
const infinity = 9999999;

// This modifies the objects in points
// but only their height property
export function planchonDarboux(points) {
  points.forEach((point) => {
    const isEdge = point.isTriangle && point.neighbors.length < 3;

    point.newHeight = isEdge ? point.height : infinity;
  });

  recursivelyIterate(points);

  points.forEach((point, i) => {
    point.height = point.newHeight;
    delete point.newHeight;
  });
}

function recursivelyIterate(points) {
  let changed = false;

  for (let _i = 0; _i < points.length; _i++) {
    const point = points[_i];
    if (point.newHeight === point.height) {
      continue;
    }

    for (let _j = 0; _j < point.neighbors.length; _j++) {
      const neighbor = point.neighbors[_j];

      if (point.height >= neighbor.newHeight + epsilon) {
        point.newHeight = point.height;
        changed = true;
        break;
      }

      const slightlyBigger = neighbor.newHeight + epsilon;
      if (
        point.newHeight > slightlyBigger &&
        slightlyBigger > point.height
      ) {
        point.newHeight = slightlyBigger;
        changed = true;
      }
    }
  }

  if (changed) {
    return recursivelyIterate(points);
  } else {
    return points.map(p => p.height);
  }
}
