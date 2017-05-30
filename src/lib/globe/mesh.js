import {
  scaleLinear,
  max,
  min,
  mean,
} from 'd3';

// import riverFinder from './river-finder';

/* eslint-disable import/no-webpack-loader-syntax */
const MeshWorker = require('worker-loader!./mesh-worker.js');

class Mesh {
  constructor(m) {
    this.m = m;

    this.worker = new MeshWorker();
  }

  generate(steps, callback) {
    this.m.done = false;
    this.steps = steps;

    this.worker.onmessage = (e) => {
      Object.assign(this.m, e.data.mesh);

      const nextStep = this.steps[e.data.nextStep];

      this.m.done = !nextStep;

      callback(this.m);

      if (nextStep) {
        this.worker.postMessage({
          type: 'step',
          step: nextStep,
          index: e.data.nextStep,
          mesh: this.m,
        });
      } else {
        this.m.done = true;
      }
    };

    this.worker.postMessage({
      type: 'step',
      step: this.steps[0],
      index: 0,
      mesh: this.m,
    });
  }

  heights() {
    return this.tiles.map(t => t.properties.height);
  }

  setDownhills() {
    this.tiles.forEach((tile) => {
      let lowestHeight = tile.properties.height;
      let downhill = null;

      tile.properties.neighbors.forEach((neighbor) => {
        if (neighbor.properties.height < lowestHeight) {
          lowestHeight = neighbor.properties.height;
          downhill = neighbor;
        }
      });

      tile.properties.downhill = downhill;
    });
  }

  fixDrainage() {
    this.tiles.forEach((tile) => {
      if (
        tile.properties.downhill ||
        tile.properties.height <= this.seaLevel
      ) {
        return;
      }

      tile.properties.height = this.seaLevel - 0.001;

      tile.properties.neighbors.forEach((neighbor) => {
        if (
          neighbor.properties.height > this.seaLevel &&
          Math.random() >= 0.8
        ) {
          neighbor.properties.height = this.seaLevel
        }
      });
    });
  }

  setFluxes() {
    this.tiles.forEach((tile) => {
      tile.properties.flux = 1 / this.tiles.length;
    });

    // descending order - peaks first
    const tilesByHeight = this.tiles.slice(0);
    tilesByHeight.sort((a, b) => {
      return b.properties.height - a.properties.height;
    });

    tilesByHeight.forEach((tile) => {
      const downhill = tile.properties.downhill;
      if (
        downhill &&
        downhill.properties.height > this.seaLevel
      ) {
        downhill.properties.flux += tile.properties.flux;
      }
    });
  }

  erode(iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      this.setDownhills();
      this.setFluxes();

      const erosionRates = this.tiles.map((tile) => {
        return Math.pow(tile.properties.flux, 3);
      });

      const heights = this.heights();
      const minH = min(heights);
      const maxH = max(heights);
      const span = maxH - minH;

      const erosionScale = scaleLinear()
        .domain([min(erosionRates), max(erosionRates)])
        .range([0, span / 12]);

      this.tiles.forEach((tile, i) => {
        if (tile.properties.height > this.seaLevel) {
          tile.properties.height = tile.properties.height - erosionScale(erosionRates[i]);
        }
      });
    }

    // this.smoothCoast();
  }

  smoothCoast() {
    this.tiles.forEach((tile) => {
      const neighborHeights = tile.properties.neighbors.map(n => n.properties.height);

      if (tile.properties.height > this.seaLevel) {
        // if it's above sea level, but more than most of the neighbors are below,
        // move it down.
        const downNeighbs = neighborHeights.filter(h => h <= this.seaLevel);

        if (downNeighbs.length > tile.properties.neighbors.length / 1.5) {
          tile.properties.height = mean(downNeighbs);
        }
      } else if  (tile.properties.height <= this.seaLevel) {
        // vice-versa
        const upNeighbs = neighborHeights.filter(h => h > this.seaLevel);

        if (upNeighbs.length >= tile.properties.neighbors.length / 1.5) {
          tile.properties.height = mean(upNeighbs);
        }
      }
    });
  }

  // findRivers(threshold) {
  //   this.setDownhills();
  //   this.fixDrainage();
  //   this.setFluxes();

  //   this.rivers = riverFinder(this.tiles, this.seaLevel, threshold);
  // }
}

export default Mesh;
