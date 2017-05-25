import {
  voronoi as Voronoi,
  scaleLinear,
  quantile,
  mean,
  min,
  max
} from 'd3';

import {
  randomPoints,
  generatePoints,
  distance
} from './points';

import { randInRange } from './random';
import { erode, planchonDarboux, setDownhills, setFluxes } from './erosion-helper';

export const vertexToString = (v) => `${v[0]}|${v[1]}`;

/**
 * Centers are polygon centers.
 * Points/corners are triangle centers.
 */
class Mesh {
  constructor(numberOfPoints) {
    this.generateMesh(numberOfPoints);
  }

  makeIntoCoast() {
    this.addRandomSlope();
    this.addRandomCone();
    this.addRandomBumps();

    // this.relaxHeights(2);

    this.findSeaLevel();

    this.niceErode(10);

    // this.findSeaLevel();


    // this depends on sea level
    this.smoothCoast(1);


    // This has to be last, so it comes after
    // all height adjustments
    this.findCoastline();

    this.findRivers();
  }

  triangleEdges() {
    return this.edges.map((edge) => {
      if (edge.hasCenters) {
        return [edge.center0, edge.center1];
      }
      return null;
    }).filter(e => !!e);
  }

  triangles() {
    return this.points
      .filter(point => point.isTriangle)
      .map((point) => {
        return {
          center: point,
          vertices: point.touches,
        };
      });
  }

  polygonEdges() {
    return this.edges.map((edge) => {
      return [edge.corner0, edge.corner1];
    }).filter(e => !!e);
  }

  generateMesh(numberOfPoints) {
    const polygonCenters = generatePoints(numberOfPoints);

    const voronoi = Voronoi()
      .x(d => d.x)
      .y(d => d.y)
      .size([1, 1])(polygonCenters);

    const cornersById = {};

    const edges = [];
    const corners = [];

    voronoi.edges.forEach((edge) => {
      const formattedEdge = {};

      // An edge means two centers. (Sometimes just one.)
      const center0 = edge.left ? edge.left.data : null;
      const center1 = edge.right ? edge.right.data : null;


      formattedEdge.center0 = center0;
      formattedEdge.center1 = center1;

      if (center0 && center1) {
        formattedEdge.hasCenters = true;

        center0.neighbors = center0.neighbors || [];
        center1.neighbors = center1.neighbors || [];

        center0.neighbors.push(center1);
        center1.neighbors.push(center0);
      }

      // An edge also means two corners. (The things it's connecting.);
      const cornerId0 = vertexToString(edge[0]);
      const cornerId1 = vertexToString(edge[1]);

      const corner0 = cornersById[cornerId0] || {
        x: edge[0][0],
        y: edge[0][1],
        height: 0,
        touches: [],
        protrudes: [],
        adjacent: [],
        id: cornerId0,
      };

      if (!cornersById[cornerId0]) {
        cornersById[cornerId0] = corner0;
        corners.push(corner0);
      }

      const corner1 = cornersById[cornerId1] || {
        x: edge[1][0],
        y: edge[1][1],
        height: 0,
        touches: [],
        protrudes: [],
        adjacent: [],
        id: cornerId1,
      };

      if (!cornersById[cornerId1]) {
        cornersById[cornerId1] = corner1;
        corners.push(corner1);
      }

      if (center0) {
        if (!corner0.touches.includes(center0)) {
          corner0.touches.push(center0);
        }
        if (!corner1.touches.includes(center0)) {
          corner1.touches.push(center0);
        }

        center0.corners = center0.corners || [];
        center0.borders = center0.borders || [];

        if (!center0.corners.includes(corner0)) {
          center0.corners.push(corner0);
        }
        if (!center0.corners.includes(corner1)) {
          center0.corners.push(corner1);
        }

        center0.borders.push(formattedEdge);
      }

      if (center1) {
        if (!corner0.touches.includes(center1)) {
          corner0.touches.push(center1);
        }
        if (!corner1.touches.includes(center1)) {
          corner1.touches.push(center1);
        }

        center1.corners = center1.corners || [];
        center1.borders = center1.borders || [];

        if (!center1.corners.includes(corner0)) {
          center1.corners.push(corner0);
        }
        if (!center1.corners.includes(corner1)) {
          center1.corners.push(corner1);
        }

        center1.borders.push(formattedEdge);
      }

      corner0.adjacent.push(corner1);
      corner1.adjacent.push(corner0);

      corner0.protrudes.push(formattedEdge);
      corner1.protrudes.push(formattedEdge);

      formattedEdge.corner0 = corner0;
      formattedEdge.corner1 = corner1;

      if (
        corner0.protrudes.length === 3 &&
        corner0.protrudes.filter(p => p.hasCenters).length === 3
      ) {
        corner0.isTriangle = true;
      }

      if (
        corner1.protrudes.length === 3 &&
        corner1.protrudes.filter(p => p.hasCenters).length === 3
      ) {
        corner1.isTriangle = true;
      }

      edges.push(formattedEdge);
    });

    // Now we tell corners that their neighbors are the
    // adjacent corners
    corners.forEach((corner) => {
      corner.neighbors = corner.adjacent;
    });


    Object.assign(this, {
      voronoi,
      edges,
      polygonCenters,
      points: corners,
      seaLevel: 0.01,
    });
  }

  addRandomSlope() {
    const s = 10;
    const polarity = Math.random() > 0.5 ? -1 : 1;

    this.addSlope({
      x: randInRange(1, 2) * s * polarity,
      y: randInRange(1, 2) * s * polarity,
    });
  }

  addSlope(vector) {
    this.points.forEach((point) => {
      point.height += (point.x * vector.x + point.y * vector.y);
    });
  }

  findSeaLevel() {
    const sortedHeights = this.points
      .map(p => p.height)
      .sort((a, b) => {
        return a - b;
      });

    const q = 0.35;
    this.seaLevel = quantile(sortedHeights, q);

    // for rendering
    const justQuantileDiff = 0.1;
    this.justBelowSeaLevel = quantile(sortedHeights, q - justQuantileDiff);
    this.justAboveSeaLevel = quantile(sortedHeights, q + justQuantileDiff);
  }

  findCoastline() {
    const coastline = [];

    this.edges.forEach((edge) => {
      if (!edge.hasCenters) {
        return;
      }

      const one = edge.corner0;
      const two = edge.corner1;

      if (
        (one.height > this.seaLevel && two.height <= this.seaLevel) ||
        (one.height <= this.seaLevel && two.height > this.seaLevel)
      ) {
        coastline.push([edge.center0, edge.center1]);
      }
    });

    this.coastline = coastline;
  }

  addRandomCone() {
    const peak = randInRange(-4, 4);

    this.addCone(peak);
  }

  addCone(peak) {
    const half = 0.5;

    const center = {
      x: half,
      y: half,
    };

    const scale = scaleLinear().domain([0, half]).range([peak, 0]);

    this.points.forEach((point) => {
      point.height += scale(distance(point, center));
    });
  }

  goodBumpAmount() {
    return Math.ceil(Math.sqrt(this.points.length));
  }

  addRandomBumps(amount) {
    const widthInPoints = Math.sqrt(this.points.length);
    const pointWidth = 1 / widthInPoints;

    const numBumps = amount || this.goodBumpAmount();

    this.addBumps(numBumps, randInRange(1, 4), pointWidth * 10)
  }

  addBumps(n, height, radius) {
    const bumpCenters = randomPoints(n);

    const scale = scaleLinear().domain([0, radius]).range([height, 0]);

    this.points.forEach((point) => {
      bumpCenters.forEach((bumpCenter) => {
        const dist = distance(point, bumpCenter);
        if (dist > radius) {
          return;
        }
        point.height += scale(dist);
      });
    });
  }

  relaxHeights(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      this.points.forEach((point) => {
        point.height = mean(point.neighbors.map(p => p.height));
      });
    }
  }

  smoothCoast(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      this.smoothCoastOnce();
    }
  }

  smoothCoastOnce() {
    this.points.forEach((point) => {

      const neighborHeights = point.neighbors.map(p => p.height);

      if (point.height > this.seaLevel) {
        // if it's above sea level, but most of the neighbors are below,
        // move it down.
        const downNeighbs = neighborHeights.filter(h => h <= this.seaLevel);

        if (downNeighbs.length >= point.neighbors.length / 2) {
          point.height = mean(downNeighbs);
        }
      } else if  (point.height <= this.seaLevel) {
        // vice-versa
        const upNeighbs = neighborHeights.filter(h => h > this.seaLevel);

        if (upNeighbs.length >= point.neighbors.length) {
          point.height = mean(upNeighbs);
        }
      }
    });
  }

  niceErode(iterations = 5) {
    const heights = this.points.map(p => p.height);
    const span = max(heights) - min(heights)
    const maxErode = span / 3;
    const minErode = span / 5;

    for (let i = 0; i < iterations; i++) {
      this.erode(randInRange(minErode, maxErode));
      this.fillSinks();
    }
  }

  erode(amount) {
    erode(this.points, this.seaLevel, amount);
  }

  // the Planchon-Darboux algorithm (????)
  fillSinks() {
    planchonDarboux(this.points);
  }

  downhillLines() {
    return this.points.map((point) => {
      if (!point.downhill) {
        return null;
      }

      return [point, point.downhill];
    }).filter(l => !!l);
  }

  isFlat() {
    let h = this.points[0].height;
    for(let i = 1; i < this.points.length; i++) {
      if (this.points[i].height !== h) {
        return false;
      }
    }

    return true;
  }

  setDownhills() {
    setDownhills(this.points);
  }

  setFluxes() {
    setFluxes(this.points);
  }

  findRivers(n = 0.01) {
    setDownhills(this.points);
    setFluxes(this.points, this.seaLevel);

    const above = this.points
      .filter(p => p.height > this.seaLevel)
      .sort((a, b) => b.flux - a.flux);

    const limit = n * (above.length / this.points.length);

    const links = [];

    this.points.forEach((point) => {
      if (
        point.neighbors < 3 ||
        !point.isTriangle ||
        point.flux <= limit ||
        point.height <= this.seaLevel ||
        !point.downhill
      ) {
        return;
      }

      if (
        point.downhill.height > this.seaLevel &&
        point.downhill.isTriangle
      ) {
        links.push({
          up: point,
          down: point.downhill,
        });
      } else {
        links.push({
          up: point,
          down: {
            x: (point.x + point.downhill.x) / 2,
            y: (point.y + point.downhill.y) / 2,
          },
        });
      }
    });

    // we have links - now merge them
    const adjacents = {};
    links.forEach((link) => {
      adjacents[link.up.id] = adjacents[link.up.id] || [];
      adjacents[link.down.id] = adjacents[link.down.id] || [];

      adjacents[link.up.id].push(link.down);
      adjacents[link.down.id].push(link.up);
    });
    this.adjacents = adjacents;
    let currentPath = null;
    const mergedPaths = [];

    while (true) {
      if (currentPath === null) {
        for(let j = 0; j < links.length; j++) {
          const link = links[j];
          if (link.merged) {
            continue;
          }

          link.merged = true;
          currentPath = [link.up, link.down];
          break;
        };

        if (currentPath === null) {
          break;
        }
      }

      let changed = false;
      for (let k = 0; k < links.length; k++) {
        const link = links[k];

        if (link.merged) {
          continue;
        }

        const pathStart = currentPath[0];
        const pathEnd = currentPath[currentPath.length - 1];

        if (
          adjacents[pathStart.id].length === 2 &&
          link.up === pathStart
        ) {
          currentPath.unshift(link.down);
        } else if (
          adjacents[pathStart.id].length === 2 &&
          link.down === pathStart
        ) {
          currentPath.unshift(link.up);
        } else if (
          adjacents[pathEnd.id].length === 2 &&
          link.up === pathEnd
        ) {
          currentPath.push(link.down);
        } else if (
          adjacents[pathEnd.id].length === 2 &&
          link.down === pathEnd
        ) {
          currentPath.push(link.up);
        } else {
          // no dice
          continue;
        }

        link.merged = true;
        changed = true;
        break;
      }

      if (!changed) {
        mergedPaths.push(currentPath);
        currentPath = null;
      }
    }

    this.rivers = mergedPaths;
  }
}

export default Mesh;
