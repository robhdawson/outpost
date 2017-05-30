import { randomPalette } from './palettes';

const randInRange = (min, max) => {
  return min + (Math.random() * (max - min));
};

const steps = [
  ['setup'],
  ['addMountains', 10, 0.1, 20],
  ['addMountains', 10, -0.1, 20],
  ['addMountains', 3, 1, 0.7],
  ['addMountains', 6, -0.7, 5],
  ['addMountains', 14, -0.6],
  ['addMountains', 100, 0.4, 0.8],
  ['addMountains', 50, -0.5, 2],
  ['relaxHeights'],
  ['addMountains', 10, 0.7],
  ['addMountains', 12, 0.6],
  ['addMountains', 40, 0.5],
  ['relaxHeights', 1],
  ['addMountains', 6, 1, 0.5],
  ['addMountains', 10, 0.6, 0.4],
];

const getSeed = () => {
  const palette = randomPalette();


  const seaLevelQuantile = randInRange(0.1, 0.9);

  return {
    palette,
    seaLevelQuantile,
    steps,
  }
};


export default getSeed;