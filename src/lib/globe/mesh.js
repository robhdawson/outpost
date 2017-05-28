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

  generate(numberOfPoints) {
    const source1 = geojsonRandom.point(numberOfPoints);
    const voronoi = geoVoronoi();

    const source2 = voronoi.polygons(source1).features.map(centroid);
    const source3 = voronoi.polygons(source2).features.map(centroid);

    this.triangles = voronoi.triangles(source3).features;

    this.triangles.forEach(function(triangle) {
      triangle.properties.height = 0;
      triangle.properties.center = triangle.properties.circumcenter;
      delete triangle.properties.circumcenter;
    });
  }

  addMountains(n, height) {
    const peaks = geojsonRandom.point(n)
      .features.map(f => f.geometry.coordinates);

    const scale = scaleLinear()
      .domain([0, height / 3])
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

function centroid(feature) {
  let x = 0;
  let y = 0;

  const points = feature.coordinates[0];
  points.forEach((point) => {
    x += point[0];
    y += point[1];
  });

  return [x/points.length, y/points.length];
};

function distance(a, b) {
  return Math.sqrt(
    Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)
  );
}