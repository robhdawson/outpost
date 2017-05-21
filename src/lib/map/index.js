import { generatePoints } from './points.js';

import { drawPoints } from './draw.js';

const NUMBER_OF_POINTS = 2096;

class Map {
  constructor() {
    this.numberOfPoints = NUMBER_OF_POINTS;
  }

  generate() {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        this.points = generatePoints(this.numberOfPoints);

        const image = drawPoints(this.points);

        resolve(image);
      }, 0);
    });
  }
}

export default Map;
