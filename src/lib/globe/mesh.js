import { geoVoronoi } from 'd3-geo-voronoi';
import {
  scaleLinear,
  max,
  min,
  mean,
  quantile,
} from 'd3';

import riverFinder from './river-finder'

class Mesh {
  constructor(props) {
    window.mesh = this;
    this.tiles = [];
    this.seaLevel = 0;

    this.seaLevelQuantile = 0.6;

    this.worker = new Worker('workers/planet-worker.js');
  }

  generate(steps, callback) {
    this.steps = steps;

    this.worker.onmessage = (e) => {
      callback(e.data.mesh);

      const nextStep = this.steps[e.data.nextStep];

      if (nextStep) {
        this.worker.postMessage({
          type: 'step',
          step: nextStep,
          index: e.data.nextStep,
        });
      } else {
        this.done = true;
      }
    };

    this.worker.postMessage({
      type: 'step',
      step: this.steps[0],
      index: 0,
    });
  }

  getPoints(numberOfPoints = 5400) {
    const points = [];

    // doing the fibonacci spiral sphere thing
    const phi = ((Math.sqrt(5) + 1) / 2) - 1; // golden ratio
    const ga = phi * 2 * Math.PI;           // golden angle

    const w = degreesToRadians(4);
    const wiggle = () => (Math.random() * w) - (w / 2);

    for(let i = 0; i < numberOfPoints; i++) {
      let lon = (ga * i) + wiggle();

      while (lon > Math.PI) {
        lon = lon - (Math.PI * 2);
      }

      const lat = Math.asin(-1 + ((2 * i) / numberOfPoints)) + wiggle();

      // geojson is lon,lat!!! don't forget this or u will die
      points.push([
        radiansToDegrees(lon),
        radiansToDegrees(lat),
      ]);
    }

    const voronoi = geoVoronoi();
    this.tiles = voronoi.polygons(points).features;

    const cornersById = {};

    this.tiles.forEach((tile) => {
      tile.properties.height = 0;
      tile.properties.center = tile.properties.site;
      tile.properties.neighbors = tile.properties.neighbours.map(i => this.tiles[i]);
      tile.properties.neighborIds = tile.properties.neighbours;
      tile.properties.id = tile.properties.site.index;
      tile.properties.corners = [];

      delete tile.properties.neighbours;

      const tileCorners = [];

      tile.coordinates[0].forEach((coords, i) => {
        if (i === tile.coordinates[0].length - 1) {
          return;
        }

        const cornerId = coords.join(',');
        const corner = cornersById[cornerId] || {
          id: cornerId,
          coords: coords,
          height: 0,
        };

        corner.touches = corner.touches || [];
        corner.touches.push(tile);

        cornersById[corner.id] = corner;

        tileCorners.push(corner);
        tile.properties.corners.push(corner);
      });

      tileCorners.forEach((corner, i) => {
        corner.adjacent = corner.adjacent || [];

        if (i > 0) {
          corner.adjacent.push(tileCorners[i - 1]);
        }

        if (i < tileCorners.length - 1) {
          corner.adjacent.push(tileCorners[i + 1]);
        }

      });
    });

    const corners = [];
    Object.keys(cornersById).forEach((id) => {
      const corner = cornersById[id];
      corners.push(corner);
    });

    this.corners = corners;
  }

  addMountains(n, height, radiusModifier = 1) {
    const peaks = [];

    for (let i = 0; i < n; i++) {
      peaks.push(randomPoint());
    }

    const radius = Math.abs((height / 8) * Math.PI * radiusModifier);

    const scale = scaleLinear()
      .domain([0, radius])
      .range([height, 0])
      .clamp(true);

    this.tiles.forEach((tile) => {
      peaks.forEach((peak) => {
        tile.properties.height += scale(distance(peak, tile.properties.center));
      });
    });

    this.setSeaLevel();
  }

  relaxHeights(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      this.tiles.forEach((tile) => {
        tile.properties.height = mean(tile.properties.neighbors.map(t => t.properties.height));
      });
    }

    this.setSeaLevel();
  }

  setSeaLevel() {
    const heights = this.heights();
    heights.sort((a, b) => a - b);
    this.seaLevel = quantile(heights, this.seaLevelQuantile);
  }

  normalizeHeights() {
    const heights = this.heights();

    const scale = scaleLinear()
      .domain([min(heights), max(heights)])
      .range([0, 1]);

    this.tiles.forEach(t => t.properties.height = scale(t.properties.height));
    this.setSeaLevel();
  }

  heights() {
    return this.tiles.map(t => t.properties.height);
  }

  setDownhills() {
    this.tiles.forEach((tile) => {
      let lowestHeight = tile.properties.height;
      let downhill = null;

      tile.properties.neighbors.forEach((neighbor) => {
        if (neighbor.properties.height < lowestHeight) {
          lowestHeight = neighbor.properties.height;
          downhill = neighbor;
        }
      });

      tile.properties.downhill = downhill;
    });
  }

  fixDrainage() {
    this.tiles.forEach((tile) => {
      if (
        tile.properties.downhill ||
        tile.properties.height <= this.seaLevel
      ) {
        return;
      }

      tile.properties.height = this.seaLevel - 0.001;

      tile.properties.neighbors.forEach((neighbor) => {
        if (
          neighbor.properties.height > this.seaLevel &&
          Math.random() >= 0.8
        ) {
          neighbor.properties.height = this.seaLevel
        }
      });
    });
  }

  setFluxes() {
    this.tiles.forEach((tile) => {
      tile.properties.flux = 1 / this.tiles.length;
    });

    // descending order - peaks first
    const tilesByHeight = this.tiles.slice(0);
    tilesByHeight.sort((a, b) => {
      return b.properties.height - a.properties.height;
    });

    tilesByHeight.forEach((tile) => {
      const downhill = tile.properties.downhill;
      if (
        downhill &&
        downhill.properties.height > this.seaLevel
      ) {
        downhill.properties.flux += tile.properties.flux;
      }
    });
  }

  erode(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      this.setDownhills();
      this.setFluxes();

      const erosionRates = this.tiles.map((tile) => {
        return Math.pow(tile.properties.flux, 3);
      });

      const heights = this.heights();
      const minH = min(heights);
      const maxH = max(heights);
      const span = maxH - minH;

      const erosionScale = scaleLinear()
        .domain([min(erosionRates), max(erosionRates)])
        .range([0, span / 12]);

      this.tiles.forEach((tile, i) => {
        if (tile.properties.height > this.seaLevel) {
          tile.properties.height = tile.properties.height - erosionScale(erosionRates[i]);
        }
      });
    }

    this.smoothCoast();
  }

  smoothCoast() {
    this.tiles.forEach((tile) => {
      const neighborHeights = tile.properties.neighbors.map(n => n.properties.height);

      if (tile.properties.height > this.seaLevel) {
        // if it's above sea level, but more than most of the neighbors are below,
        // move it down.
        const downNeighbs = neighborHeights.filter(h => h <= this.seaLevel);

        if (downNeighbs.length > tile.properties.neighbors.length / 1.5) {
          tile.properties.height = mean(downNeighbs);
        }
      } else if  (tile.properties.height <= this.seaLevel) {
        // vice-versa
        const upNeighbs = neighborHeights.filter(h => h > this.seaLevel);

        if (upNeighbs.length >= tile.properties.neighbors.length / 1.5) {
          tile.properties.height = mean(upNeighbs);
        }
      }
    });
  }

  findRivers(threshold) {
    this.setDownhills();
    this.fixDrainage();
    this.setFluxes();

    this.rivers = riverFinder(this.tiles, this.seaLevel, threshold);
  }
}

export default Mesh;

function radiansToDegrees(x) {
  return x * 180 / Math.PI
};

function degreesToRadians(x) {
  return x * (Math.PI/180)
};

function distance(a, b) {
  const lonA = a[0];
  const lonB = b[0];
  const latA = a[1];
  const latB = b[1];

  const dLat = degreesToRadians(latB - latA);
  const dLon = degreesToRadians(lonB - lonA);

  const n =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(latA)) * Math.cos(degreesToRadians(latB)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
  return c;
}

function randomPoint() {
  // cos-1(2x - 1), where x is uniformly distributed and x ∈ [0, 1)

  const lon = (Math.random() * 360) - 180;

  const latThing = Math.random();
  const lat = radiansToDegrees(Math.acos((2 * latThing) - 1)) - 90;
  return [lon, lat];
}