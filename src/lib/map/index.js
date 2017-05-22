import { generatePoints } from './points.js';
import Mesh from './mesh';

import { drawMesh } from './draw.js';

const NUMBER_OF_POINTS = 2096;

class Map {
  constructor({ numberOfPoints } = {}) {
    this.numberOfPoints = numberOfPoints || NUMBER_OF_POINTS;
    window.map = this;
  }

  generate() {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const points = generatePoints(this.numberOfPoints);
        this.mesh = new Mesh(points);

        const canvas = drawMesh(this.mesh);

        const image = canvas.toDataURL();
        resolve(image);
      }, 0);
    });
  }
}

export default Map;
