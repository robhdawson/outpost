import { generatePoints } from './points.js';

import { drawPoints } from './draw.js';

const NUMBER_OF_POINTS = 2096;

class Map {
  constructor() {
    this.numberOfPoints = NUMBER_OF_POINTS;
  }

  generate() {
    this.points = generatePoints(this.numberOfPoints);

    return new Promise((resolve, reject) => {
      const image = drawPoints(this.points);

      resolve(image);
    });
  }
}

export default Map;
