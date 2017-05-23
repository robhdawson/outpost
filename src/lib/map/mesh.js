import { voronoi as Voronoi } from 'd3-voronoi';

import { generatePoints } from './points';
import { rnorm } from './random';

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
    // adjacent corners that are ALSO full triangles.
    corners.forEach((corner) => {
      corner.neighbors = corner.adjacent.filter(a => a.isTriangle);
    });


    Object.assign(this, {
      voronoi,
      edges,
      polygonCenters,
      points: corners,
    });
  }

  addRandomSlope() {
    const s = 4;

    this.addSlope({
      x: rnorm() * s,
      y: rnorm() * s,
    });
  }

  addSlope(vector) {
    this.points.forEach((point) => {
      point.height += (point.x * vector.x + point.y * vector.y);
    });
  }
}

export default Mesh;
