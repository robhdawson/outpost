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
import { planchonDarboux } from './erosion-helper';

export const vertexToString = (v) => v.join(',');

class Mesh {
  constructor(numberOfPoints) {
    this.generateMesh(numberOfPoints);
  }

  triangles() {
    return this.points
      .filter(point => point.isTriangle)
      .map((point) => {
        return {
          center: point,
          vertices: point.corners,
        };
      });
  }

  generateMesh(numberOfPoints) {
    const corners = generatePoints(numberOfPoints);

    // We're using the voronoi in a bit of a weird way - we generate it based
    // on where we want our triangle-tile corners to be. The actual
    // voronoi polygons aren't relevant to us ever.
    const voronoi = Voronoi()
      .x(d => d.x)
      .y(d => d.y)
      .size([1, 1])(corners);

    const pointsById = {};

    const edges = [];
    const points = [];

    voronoi.edges.forEach((edge) => {
      const formattedEdge = {};

      // An edge means two points. (Sometimes just one,)
      const corner0 = edge.left ? edge.left.data : null;
      const corner1 = edge.right ? edge.right.data : null;


      formattedEdge.corner0 = corner0;
      formattedEdge.corner1 = corner1;

      if (corner0 && corner1) {
        formattedEdge.hasCorners = true;
      }

      // An edge also means two points (i.e. our triangle centers)
      const pointId0 = vertexToString(edge[0]);
      const pointId1 = vertexToString(edge[1]);

      const point0 = pointsById[pointId0] || {
        x: edge[0][0],
        y: edge[0][1],
        height: 0,
        corners: [],
        edges: [],
        neighbors: [],
        id: pointId0,
      };

      if (!pointsById[pointId0]) {
        pointsById[pointId0] = point0;
        points.push(point0);
      }

      const point1 = pointsById[pointId1] || {
        x: edge[1][0],
        y: edge[1][1],
        height: 0,
        corners: [],
        edges: [],
        neighbors: [],
        id: pointId1,
      };

      if (!pointsById[pointId1]) {
        pointsById[pointId1] = point1;
        points.push(point1);
      }

      if (corner0) {
        if (!point0.corners.includes(corner0)) {
          point0.corners.push(corner0);
        }
        if (!point1.corners.includes(corner0)) {
          point1.corners.push(corner0);
        }

        corner0.points = corner0.points || [];
        corner0.borders = corner0.borders || [];

        if (!corner0.points.includes(point0)) {
          corner0.points.push(point0);
        }

        if (!corner0.points.includes(point1)) {
          corner0.points.push(point1);
        }

        corner0.borders.push(formattedEdge);
      }

      if (corner1) {
        if (!point0.corners.includes(corner1)) {
          point0.corners.push(corner1);
        }

        if (!point1.corners.includes(corner1)) {
          point1.corners.push(corner1);
        }

        corner1.points = corner1.points || [];
        corner1.borders = corner1.borders || [];

        if (!corner1.points.includes(point0)) {
          corner1.points.push(point0);
        }
        if (!corner1.points.includes(point1)) {
          corner1.points.push(point1);
        }

        corner1.borders.push(formattedEdge);
      }

      point0.neighbors.push(point1);
      point1.neighbors.push(point0);

      point0.edges.push(formattedEdge);
      point1.edges.push(formattedEdge);

      formattedEdge.point0 = point0;
      formattedEdge.point1 = point1;

      if (
        point0.edges.length === 3 &&
        point0.edges.filter(p => p.hasCorners).length === 3
      ) {
        point0.isTriangle = true;
      }

      if (
        point1.edges.length === 3 &&
        point1.edges.filter(p => p.hasCorners).length === 3
      ) {
        point1.isTriangle = true;
      }

      edges.push(formattedEdge);
    });

    points.forEach((point) => {
      if (
        !point.isTriangle ||
        point.neighbors.filter(p => p.isTriangle).length >= 3
      ) {
        return;
      }

      point.isBorder = true;
    });

    edges.forEach((edge) => {
      if (
        (edge.point0.isBorder && !edge.point1.isTriangle) ||
        (edge.point1.isBorder && !edge.point0.isTriangle)
      ) {
        edge.isBorder = true;
      }
    });

    Object.assign(this, {
      edges,
      points,
      seaLevel: 0,
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

    // only used for rendering
    this.justBelowSeaLevel = quantile(sortedHeights, q - 0.1);
    this.justAboveSeaLevel = quantile(sortedHeights, q + 0.001);
  }

  findCoastline() {
    const coastline = [];

    this.edges.forEach((edge) => {
      if (!edge.hasCorners) {
        return;
      }

      const one = edge.point0;
      const two = edge.point1;

      if (
        (one.height > this.seaLevel && two.height <= this.seaLevel) ||
        (one.height <= this.seaLevel && two.height > this.seaLevel)
      ) {
        coastline.push([edge.corner0, edge.corner1]);
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

  normalizeHeights() {
    const heights = this.points.map(p => p.height);
    const scale = scaleLinear()
      .domain([min(heights), max(heights)])
      .range([0, 1]);

    this.points.forEach(p => p.height = scale(p.height));
    this.findSeaLevel();
  }

  smoothCoast(iterations = 2) {
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

  erode(iterations = 8) {
    this.normalizeHeights();

    this.setDownhills();
    this.setFluxes();

    const erosionRates = this.points.map((point) => {
      return Math.pow(point.flux, 3);
    });

    const erosionScale = scaleLinear()
      .domain([min(erosionRates), max(erosionRates)])
      .range([0, 1]);

    for (let i = 0; i < iterations; i++) {
      this.points.forEach((point, i) => {
        point.height = point.height - erosionScale(erosionRates[i])
      });

      this.fillSinks();
    }

    this.normalizeHeights();
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
    this.points.forEach((point) => {
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

  setFluxes() {
    this.points.forEach((point) => {
      point.flux = 1 / this.points.length;
    });

    const pointsByHeight = this.points.slice(0);

    pointsByHeight.sort((a, b) => {
      return b.height - a.height;
    });

    pointsByHeight.forEach((point) => {
      if (
        point.downhill &&
        point.downhill.height > this.seaLevel
      ) {
        point.downhill.flux += point.flux;
      }
    });
  }

  findRivers(n = 0.01) {
    this.setDownhills();
    this.setFluxes();

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
