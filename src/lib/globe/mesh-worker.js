import { geoVoronoi } from 'd3-geo-voronoi';
import {
  scaleLinear,
  // scaleQuantize,
  // quantize,
  // interpolateRgb,
  max,
  min,
  mean,
  quantile,
} from 'd3';

self.onmessage = (e) => {
  if (e.data.type === 'step') {
    const step = e.data.step;
    const stepName = step[0];
    const stepArgs = step.slice(1);

    const stepIndex = e.data.index;

    const mesh = e.data.mesh || {};

    if (steps[stepName]) {
      console.log(`Performing step: ${stepName}`);
      steps[stepName].apply(mesh, stepArgs);

      self.postMessage({
        nextStep: stepIndex + 1,
        mesh: mesh,
      });
    } else {
      console.log(`Unknown step: ${stepName}`);
    }
  }
};

const steps = {
  setup: function(numberOfPoints = 2500) {
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

    for (let t = 0; t < this.tiles.length; t++) {
      const tile = this.tiles[t];

      tile.properties.height = 0;
      tile.properties.center = tile.properties.site;
      // tile.properties.neighbors = [];

      // for (let n = 0; n < tile.properties.neighbours.length; n++) {
      //   tile.properties.neighbors.push(shallowTile(this.tiles[tile.properties.neighbours[n]]));
      // }

      tile.properties.neighborIndexes = tile.properties.neighbours;
      tile.properties.id = tile.properties.site.index;
      tile.properties.corners = [];

      delete tile.properties.neighbours;

      const tileCorners = [];

      for (let c = 0; c < tile.coordinates[0]; c++) {
        const coords = tile.coordinates[c];

        if (c === tile.coordinates[0].length - 1) {
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
      }

      for (let tc = 0; tc < tileCorners.length; tc++) {
        const corner = tileCorners[tc];
        corner.adjacent = corner.adjacent || [];

        if (c > 0) {
          corner.adjacent.push(tileCorners[c - 1]);
        }

        if (c < tileCorners.length - 1) {
          corner.adjacent.push(tileCorners[c + 1]);
        }

      }
    }

    const corners = [];
    Object.keys(cornersById).forEach((id) => {
      const corner = cornersById[id];
      corners.push(corner);
    });

    this.corners = corners;

    this.seaLevel = 0;

    afterHeightChange(this);
  },

  addMountains: function(n, height, radiusModifier = 1) {
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

    afterHeightChange(this);
  },

  normalizeHeights: function() {
    const scale = scaleLinear()
      .domain([min(this.heights), max(this.heights)])
      .range([0, 1]);

    this.tiles.forEach(t => t.properties.height = scale(t.properties.height));
    afterHeightChange(this);
  },

  relaxHeights: function(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      this.tiles.forEach((tile) => {
        const neighborHeights = [];
        const ns = neighbors(tile, this);
        for (let n = 0; n < ns.length; n++) {
          neighborHeights.push(ns[n].properties.height);
        }
        tile.properties.height = mean(neighborHeights);
      });
    }

    afterHeightChange(this);
  },

  // erode(iterations = 1) {
  //   for (let i = 0; i < iterations; i++) {
  //     this.setDownhills();
  //     this.setFluxes();

  //     const erosionRates = this.tiles.map((tile) => {
  //       return Math.pow(tile.properties.flux, 3);
  //     });

  //     const heights = this.heights();
  //     const minH = min(heights);
  //     const maxH = max(heights);
  //     const span = maxH - minH;

  //     const erosionScale = scaleLinear()
  //       .domain([min(erosionRates), max(erosionRates)])
  //       .range([0, span / 12]);

  //     this.tiles.forEach((tile, i) => {
  //       if (tile.properties.height > this.seaLevel) {
  //         tile.properties.height = tile.properties.height - erosionScale(erosionRates[i]);
  //       }
  //     });
  //   }

  //   smoothCoast(this);

  //   afterHeightChange(this);
  // }
}

function afterHeightChange(mesh) {
  setSeaLevel(mesh);
  setColors(mesh);
}

function setHeights(mesh) {
  const heights = [];
  for (let i = 0; i < mesh.tiles.length; i++) {
    heights.push(mesh.tiles[i].properties.height);
  }

  mesh.heights = heights;
}

function setSeaLevel(mesh) {
  setHeights(mesh);
  const h = mesh.heights.slice(0);
  h.sort((a, b) => a - b);
  mesh.seaLevel = quantile(h, mesh.seaLevelQuantile);
}

function setColors(mesh) {
  const heights = mesh.heights.slice(0);
  heights.sort((a, b) => a - b);

  const seaHeights = [];
  const landHeights = [];

  heights.forEach((height) => {
    if (height > mesh.seaLevel) {
      landHeights.push(height);
    } else {
      seaHeights.push(height);
    }
  });

  const seaScale = scaleLinear()
    .domain([
      seaHeights[0],
      quantile(seaHeights, 0.4),
      seaHeights[seaHeights.length - 1],
    ])
    .range([
      mesh.palette.deepWater,
      mesh.palette.midWater,
      mesh.palette.shallowWater,
    ]);

  const landScale = scaleLinear()
    .domain([
      landHeights[0],
      quantile(landHeights, 0.4),
      quantile(landHeights, 0.9),
      landHeights[landHeights.length - 1],
    ])
    .range([
      mesh.palette.beach,
      mesh.palette.forest,
      mesh.palette.peakStart,
      mesh.palette.peak,
    ]);

  const byColor = {};

  mesh.tiles.forEach((tile) => {
    const h = tile.properties.height;
    const color = h > mesh.seaLevel ? landScale(h) : seaScale(h);
    tile.properties.color = color;

    byColor[color] = byColor[color] || {
      type: 'GeometryCollection',
      geometries: [],
    };

    byColor[color].geometries.push(tile);
  });

  mesh.tilesByColor = byColor;
}

function neighbors(tile, mesh) {
  return tile.properties.neighborIndexes.map(i => mesh.tiles[i]);
}

function radiansToDegrees(x) {
  return x * 180 / Math.PI
}

function degreesToRadians(x) {
  return x * (Math.PI/180)
}

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
  const lon = (Math.random() * 360) - 180;

  const latThing = Math.random();
  const lat = radiansToDegrees(Math.acos((2 * latThing) - 1)) - 90;
  return [lon, lat];
}
