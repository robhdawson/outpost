import {
  geoOrthographic,
  geoPath,
  timer,
  now,
  scaleLinear,
  select,
  drag,
  quantile,
  mouse,
} from 'd3';

import Mesh from './mesh';
import { eulerAngles } from './euler-angles';

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
  ['generate'],

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

  ['erode'],
  ['erode'],
  ['erode'],
  ['erode'],
  ['erode'],

  // ['findRivers'],
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

    this.lastDragStart = this.projection.invert(mouse(this.canvas));
  }

  dragging() {
    const position = this.projection.invert(mouse(this.canvas));
    const rotation = this.projection.rotate();

    const newRotation = eulerAngles(
      this.lastDragStart,
      position,
      rotation,
    );

    if (newRotation) {
      this.projection.rotate(newRotation);
    }
  }

  dragEnd() {
    this.lastDragStart = null;
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
        quantile(seaHeights, 0.4),
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

    if (this.mesh.rivers) {
      this.ctx.globalAlpha = 0.6;
      this.mesh.rivers.forEach((river) => {
        this.stroke({
            type: 'LineString',
            coordinates: river,
          },
          colors.shallowWater,
          2,
        );
      });
      this.ctx.globalAlpha = 1;
    }
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

  stroke(object, color, lineWidth = 1) {
    this.ctx.beginPath();
    this.path(object);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }

  generate() {
    this.mesh = new Mesh();
    this.timeouts.push(window.setTimeout(() => {
      this.generateSteps();
    }, 0));
  }

  generateSteps() {
    meshSteps.forEach((step, i) => {
      this.timeouts.push(window.setTimeout(() => {
        console.log('step:', step);
        this.mesh[step[0]].apply(this.mesh, step.slice(1));
      }, 500 * i));
    });
  }
}

export default Globe;
