import Mesh from './mesh';

import { drawMesh } from './draw.js';

const NUMBER_OF_POINTS = 2096;

const GEN_STEPS = [
  ['addRandomSlope'],
  ['addRandomCone'],
  ['addRandomBumps'],
  ['relaxHeights'],
  ['findSeaLevel'],
  ['fillSinks', 'findCoastline'],
  ['niceErode', 'findCoastline'],
  ['smoothCoast', 'findCoastline'],
  ['findRivers'],
];

class Map {
  constructor({ numberOfPoints } = {}) {
    this.numberOfPoints = numberOfPoints || NUMBER_OF_POINTS;
  }

  generate() {
    this.mesh = new Mesh(this.numberOfPoints);

    GEN_STEPS.forEach((stepFuncs, i) => {
      stepFuncs.forEach(funcName => this.mesh[funcName]());
    });
  }

  get image() {
    const canvas = drawMesh(this.mesh);
    return canvas.toDataURL();
  }
}

export default Map;
