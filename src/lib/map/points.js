// All points generated between 0 and 1.

import { voronoi as Voronoi } from 'd3-voronoi';

export function randomPoints(amt) {
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
  const voronoi = Voronoi()
    .x(d => d.x)
    .y(d => d.y)
    .size([1, 1]);

  for (let i = 0; i < iterations; i++) {
    pts = voronoi.polygons(pts).map(centroid);
  }

  return pts;
}

export function generatePoints(amt) {
  const points = makeGood(randomPoints(amt), 3);

  let id = 0;

  points.forEach((point) => {
    point.id = id;
    id++;
  });

  return points;
}

export function distance(a, b) {
  return Math.sqrt(
    Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)
  );
}
