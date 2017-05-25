import { min, max, scaleLinear } from 'd3';

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
    if (point.newHeight === infinity) {
      delete point.newHeight;
      return;
    }

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


// also mutates heights
export function erode(points, seaLevel, amount) {
  setDownhills(points);

  setFluxes(points, seaLevel);

  // const slopes = getSlopes(points);
  const slopes = [];

  const erosionRates = getErosionRates(points, slopes);
  const erosionScale = scaleLinear()
    .domain([min(erosionRates), max(erosionRates)])
    .range([0, amount]);

  points.forEach((point, i) => {
    if (point.height < seaLevel) {
      return;
    }

    const er = erosionRates[i];
    point.height = point.height - erosionScale(er);
  });
}

export function setDownhills(points) {
  points.forEach((point) => {
    const isEdge = point.neighbors.length < 3;
    if (isEdge) {
      point.downhill = null;
      return;
    }

    let best = null;
    let bestH = point.height;

    point.neighbors.forEach((neighbor) => {
      if (neighbor.height <= bestH) {
        best = neighbor;
        bestH = neighbor.height;
      }
    });

    point.downhill = best;
  });
}

function getErosionRates(points, slopes) {
  return points.map((point, i) => {
    return point.flux * point.flux * point.flux;
  });
}

export function setFluxes(points, seaLevel) {
  points.forEach((point) => {
    point.flux = 1 / points.length;
  });

  const pointsByHeight = points.slice(0).sort((a, b) => {
    return b.height - a.height;
  });

  pointsByHeight.forEach((point) => {
    if (point.downhill) {
      point.downhill.flux += point.flux;
    }
  });
}

// function getSlopes(points) {
//   return points.map((point) => {
//     return getSlope(point);
//   });
// }

// function getSlope(point) {
//   const discount = !point.isTriangle || point.neighbors.length < 3;
//   if (discount) {
//     return 0;
//   }

//   const p0 = point.neighbors[0];
//   const p1 = point.neighbors[1];
//   const p2 = point.neighbors[2];

//   const x1 = p1.x - p0.x;
//   const x2 = p2.x - p0.x;
//   const y1 = p1.y - p0.y;
//   const y2 = p2.y - p0.y;

//   const det = x1 * y2 - x2 * y1;

//   const h1 = p1.height - p0.height;
//   const h2 = p2.height - p0.height;

//   const trislope = [
//     ((y2 * h1) - (y1 * h2)) / det,
//     ((x1 * h2) - (x2 * h1)) / det,
//   ];

//   return Math.sqrt((trislope[0] * trislope[0]) + (trislope[1] * trislope[1]));
// }






