import { generatePoints } from './points.js';
import Mesh from './mesh';

import { drawMesh } from './draw.js';

const NUMBER_OF_POINTS = 2096;

class Map {
  constructor() {
    this.numberOfPoints = NUMBER_OF_POINTS;
    window.map = this;
  }

  generate() {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        this.points = generatePoints(this.numberOfPoints);
        this.mesh = new Mesh(this.points);

        const image = drawMesh(this.mesh, this.points);

        resolve(image);
      }, 0);
    });
  }
}

export default Map;
