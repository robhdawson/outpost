// All points generated between 0 and 1.

import { voronoi } from 'd3-voronoi';

function randomPoints(amt) {
  const points = [];
  for (let i = 0; i < amt; i++) {
    points.push({
      x: Math.random(),
      y: Math.random(),
    });
  }

  return points;
}

function centroid(polygonPoints) {
  let x = 0;
  let y = 0;

  polygonPoints.forEach((point) => {
    x += point[0];
    y += point[1];
  });

  return {
    x: x/polygonPoints.length,
    y: y/polygonPoints.length,
  };
}

function makeGood(points, iterations = 1) {
  let pts = points;
  const v = voronoi()
    .x(d => d.x)
    .y(d => d.y)
    .size([1, 1]);

  for (let i = 0; i < iterations; i++) {
    pts = v.polygons(pts).map(centroid);
  }

  return pts;
}

export function generatePoints(amt) {
  return makeGood(randomPoints(amt), 3);
}
