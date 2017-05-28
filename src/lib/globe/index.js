import {
  geoOrthographic,
  geoPath,
  timer,
  now,
  scaleLinear,
  select,
  drag,
  event as d3Event,
  quantile,
} from 'd3';

import Mesh from './mesh';

const colors = {
  space: '#ffffff',

  deepWater: '#302e66',
  midWater: '#4f4f7f',
  shallowWater: '#8b8aad',

  beach: '#a39984',
  forest: '#cec8ab',
  peakStart: '#ccc8b9',
  peak: '#fffff8',

  coastline: '#999277',
  river: '#6d6b91',
};

const AUTOROTATE_SPEED = 0.007; // degrees per ms

const meshSteps = [
  ['addMountains', 3, 1, 0.7],
  ['addMountains', 5, -0.7, 3.6],
  ['relaxHeights'],
  ['addMountains', 10, 0.7],
  ['addMountains', 13, 0.6],
  ['addMountains', 13, -0.6],
  ['addMountains', 40, 0.5],
  ['addMountains', 50, 0.4, 3],
  ['relaxHeights', 1],
  ['addMountains', 6, 1, 0.5],
  ['addMountains', 10, 0.6, 0.4],


  ['normalizeHeights'],

];

class Globe {
  constructor() {
    window.globe = this;

    this.mesh = new Mesh();

    this.projection = geoOrthographic().precision(0.1);

    this.timeouts = [];
  }

  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.scale();

    this.path = geoPath(this.projection).context(this.ctx);
    this.lastTime = now();

    this.isRotating = true;

    this.timer = timer(this.tick.bind(this));

    const d = drag()
      .subject(() => {
        var r = this.projection.rotate();
        return {
          x: this.rotateScaleX.invert(r[0]),
          y: this.rotateScaleY.invert(r[1])
        };
      })
      .on('start', this.dragStart.bind(this))
      .on('drag', this.dragging.bind(this))
      .on('end', this.dragEnd.bind(this));

    select(this.canvas).call(d);
  }

  scale() {
    this.width = parseFloat(this.canvas.getAttribute('width'));
    this.height = parseFloat(this.canvas.getAttribute('height'));

    this.projection
      .scale(0.8 * Math.min(this.width, this.height) / 2)
      .translate([this.width / 2, this.height / 2]);

    this.rotateScaleX = scaleLinear()
      .domain([0, this.width])
      .range([-180, 180]);

    this.rotateScaleY = scaleLinear()
      .domain([0, this.height])
      .range([90, -90]);
  }

  detach() {
    if (this.timer) {
      this.timer.stop();
      delete this.timer;
    }
    this.clearTimeouts();
  }

  reset() {
    this.clearTimeouts();
  }

  clearTimeouts() {
    this.timeouts.forEach(t => window.clearTimeout(t));
    this.timeouts = [];
  }

  dragStart() {
    window.clearTimeout(this.dragTimeout);
    this.isRotating = false;
  }

  dragging() {
    this.projection.rotate([this.rotateScaleX(d3Event.x), this.rotateScaleY(d3Event.y)]);
  }

  dragEnd() {
    this.dragTimeout = window.setTimeout(() => {
      this.isRotating = true;
    }, 1000);
  }

  tick(elapsed) {
    const thisTime = now();


    if (this.isRotating) {
      const diff = thisTime - this.lastTime;

      if (diff < elapsed) {
        const currentRotation = this.projection.rotate();
        currentRotation[0] += diff * AUTOROTATE_SPEED;
        this.projection.rotate(currentRotation);
      }
    }

    this.lastTime = thisTime;

    this.render();
  }

  render() {
    this.ctx.fillStyle = colors.space;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.fill({type: 'Sphere'}, colors.midWater);

    const heights = this.mesh.heights();
    heights.sort((a, b) => a - b);

    const seaHeights = [];
    const landHeights = [];

    heights.forEach((height) => {
      if (height > this.mesh.seaLevel) {
        landHeights.push(height);
      } else {
        seaHeights.push(height);
      }
    });

    const seaScale = scaleLinear()
      .domain([
        seaHeights[0],
        quantile(seaHeights, 0.3),
        seaHeights[seaHeights.length - 1],
      ])
      .range([
        colors.deepWater,
        colors.midWater,
        colors.shallowWater,
      ]);

    const landScale = scaleLinear()
      .domain([
        landHeights[0],
        quantile(landHeights, 0.9),
        quantile(landHeights, 0.96),
        landHeights[landHeights.length - 1],
      ])
      .range([
        colors.beach,
        colors.forest,
        colors.peakStart,
        colors.peak,
      ]);

    this.mesh.tiles.forEach((tile) => {
      const h = tile.properties.height;
      const color = h > this.mesh.seaLevel ? landScale(h) : seaScale(h);
      this.fillAndStroke(tile, color);
    });
  }

  fillAndStroke(object, color) {
    this.ctx.beginPath();
    this.path(object);
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.fill();
    this.ctx.stroke();
  }

  fill(object, color) {
    this.ctx.beginPath();
    this.path(object);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  stroke(object, color) {
    this.ctx.beginPath();
    this.path(object);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  generate() {
    this.mesh = new Mesh();
    this.timeouts.push(window.setTimeout(() => {
      this.mesh.generate();
      this.generateSteps();
    }, 0));
  }

  generateSteps() {
    meshSteps.forEach((step, i) => {
      this.timeouts.push(window.setTimeout(() => {
        console.log('step:', step);
        this.mesh[step[0]].apply(this.mesh, step.slice(1));
      }, 1000 * i));
    });
  }
}

export default Globe;
