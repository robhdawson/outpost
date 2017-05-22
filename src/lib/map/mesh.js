import { voronoi as Voronoi } from 'd3-voronoi';

export const vertexToString = (v) => `${v[0]}|${v[1]}`;
export const stringToVertex = (s) => {
  return s.split('|').map(parseFloat);
};

class Mesh {
  constructor(points) {
    const voronoi = Voronoi()
      .x(d => d.x)
      .y(d => d.y)
      .size([1, 1])(points);

    const vertices = [];
    const vertexIds = {};

    const adjacencies = {};
    const edges = [];

    const triangles = {};

    voronoi.edges.forEach((edge) => {
      const v0 = edge[0];
      let s0 = vertexToString(v0);
      let VId0 = vertexIds[s0];
      if (!VId0) {
        VId0 = vertices.length;
        vertices.push(v0);
        vertexIds[s0] = VId0;
      }

      const v1 = edge[1]
      let s1 = vertexToString(v1);
      let VId1 = vertexIds[s1];
      if (!VId0) {
        VId1 = vertices.length;
        vertices.push(v1);
        vertexIds[s1] = VId1;
      }

      adjacencies[s0] = adjacencies[s0] || [];
      adjacencies[s1] = adjacencies[s1] || [];

      adjacencies[s0].push(v1);
      adjacencies[s1].push(v0);

      edges.push(edge);

      triangles[s0] = triangles[s0] || [];
      triangles[s1] = triangles[s1] || [];

      if (!triangles[s0].includes(edge.left)) {
        triangles[s0].push(edge.left);
      }
      if (edge.right && !triangles[s0].includes(edge.right)) {
        triangles[s0].push(edge.right);
      }

      if (!triangles[s1].includes(edge.left)) {
        triangles[s1].push(edge.left);
      }
      if (edge.right && !triangles[s1].includes(edge.right)) {
        triangles[s1].push(edge.right);
      }
    });

    this.points = points;
    this.voronoi = voronoi;
    this.vertices = vertices;
    this.vertexIds = vertexIds;
    this.adjacencies = adjacencies;
    this.edges = edges;
    this.triangles = triangles;
  }

  map(func) {
    const mapped = this.vertices.map(func);
    mapped.mesh = this;
    return mapped;
  }
}

export default Mesh;
