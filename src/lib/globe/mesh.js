import { geoVoronoi } from 'd3-geo-voronoi';
import {
  scaleLinear,
  max,
  min,
  mean,
  quantile,
} from 'd3';

class Mesh {
  constructor(props) {
    window.mesh = this;
    this.tiles = [];
    this.seaLevel = 0;
  }

  generate(numberOfPoints = 5000) {
    const points = [];

    // doing the fibonacci spiral sphere thing
    const phi = ((Math.sqrt(5) + 1) / 2) - 1; // golden ratio
    const ga = phi * 2 * Math.PI;           // golden angle

    for(let i = 0; i < numberOfPoints; i++) {
      let lon = (ga * i);

      while (lon > Math.PI) {
        lon = lon - (Math.PI * 2);
      }

      const lat = Math.asin(-1 + ((2 * i) / numberOfPoints));

      // geojson is lon,lat!!! don't forget this or u will die
      points.push([
        radiansToDegrees(lon),
        radiansToDegrees(lat),
      ]);
    }

    const voronoi = geoVoronoi();
    this.tiles = voronoi.polygons(points).features;

    this.tiles.forEach((tile) => {
      tile.properties.height = 0;
      tile.properties.center = tile.properties.site;
      tile.properties.neighbors = tile.properties.neighbours.map(i => this.tiles[i]);
      tile.properties.neighborIds = tile.properties.neighbours;
      delete tile.properties.neighbours;
    });
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
    this.seaLevel = quantile(heights, 0.5);
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