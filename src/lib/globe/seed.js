import { randomPalette } from './palettes';
import namer from './namer';

const randInRange = (min, max) => {
  return min + (Math.random() * (max - min));
};

const posNeg = () => Math.random() < 0.5 ? -1 : 1;

const bigFlat = (p) => {
  return [
    'addMountains',
    randInRange(10, 30),
    randInRange(0.1, 0.2) * (p ? p : posNeg()),
    randInRange(20, 30),
  ];
}

const peaks = (p = 1) => {
  return [
    'addMountains',
    randInRange(3, 8),
    randInRange(1, 1.5) * p,
    randInRange(0.7, 0.9),
  ];
}

const littles = () => {
  return [
  'addMountains',
    randInRange(100, 150),
    randInRange(0.4, 0.6) * posNeg(),
    randInRange(0.9, 1.2),
  ];
}

const getSteps = () => {
  const steps = [['setup']];
  steps.push(bigFlat());
  steps.push(bigFlat());
  steps.push(bigFlat(-1));
  steps.push(peaks());
  steps.push(peaks(-1));
  steps.push(['relaxHeights']);
  steps.push(littles());
  steps.push(peaks());
  steps.push(littles());
  steps.push(peaks(posNeg()));
  steps.push(['relaxHeights', 2]);
  steps.push(['smoothCoast', 3]);
  steps.push(['normalizeHeights']);
  return steps;
}

const getSeed = () => {
  const palette = randomPalette();
  const seaLevelQuantile = randInRange(0.1, 0.9);
  const steps = getSteps();

  return {
    palette,
    seaLevelQuantile,
    steps,
    name: namer(),
  };
};

export default getSeed;
