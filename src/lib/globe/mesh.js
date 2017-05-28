import geojsonRandom from 'geojson-random';
import {
  geoVoronoi,
} from 'd3-geo-voronoi';
import {
  scaleLinear,
  max,
  min,
} from 'd3';

class Mesh {
  constructor(props) {
    window.mesh = this;
    this.triangles = [];
  }

  generate(numberOfPoints = 3000) {
    const points = [];
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

    this.points = points;

    const voronoi = geoVoronoi();
    this.triangles = voronoi.triangles(points).features;

    this.triangles.forEach(function(triangle) {
      triangle.properties.height = 0;
      triangle.properties.center = triangle.properties.circumcenter;
      delete triangle.properties.circumcenter;
    });
  }

  addMountains(n, height, radiusModifier = 1) {
    const peaks = geojsonRandom.point(n)
      .features.map(f => f.geometry.coordinates);

    const radius = (height / 8) * Math.PI * radiusModifier;

    const scale = scaleLinear()
      .domain([0, radius])
      .range([height, 0])
      .clamp(true);

    this.triangles.forEach((triangle) => {
      peaks.forEach((peak) => {
        triangle.properties.height += scale(distance(peak, triangle.properties.center));
      });
    });
  }

  normalizeHeights() {
    const heights = this.triangles.map(t => t.properties.height);

    const scale = scaleLinear()
      .domain([min(heights), max(heights)])
      .range([0, 1]);

    this.triangles.forEach(t => t.properties.height = scale(t.properties.height));
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
  const latA = a[1];
  const latB = b[1];
  const lonA = a[0];
  const lonB = b[0];

  const dLat = degreesToRadians(latB - latA);
  const dLon = degreesToRadians(lonB - lonA);

  const n =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(latA)) * Math.cos(degreesToRadians(latB)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;

  var c = 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
  return c;
}