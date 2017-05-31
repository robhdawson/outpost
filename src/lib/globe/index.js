import {
  geoOrthographic,
  geoPath,
  timer,
  now,
  select,
  drag,
  mouse,
} from 'd3';

import GIF from 'gif.js';

import Mesh from './mesh';
import { eulerAngles } from './euler-angles';
import getSeed from './seed';

const AUTOROTATE_SPEED = 0.03; // degrees per ms

const GIF_FRAMES = 60;

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

class Globe {
  constructor() {
    window.globe = this;
    this.lastMesh = {};

    this.projection = geoOrthographic()
      .precision(0.01)
      .clipAngle(90)
      .rotate([0, 0, 0]);
  }

  generate() {
    this.rotateDirection = ([
      sample([-1, 1]),
      sample([-1, 0, 0, 1]),
      sample([-1, 0, 0, 1]),
    ]);

    const seed = getSeed();

    if (this.mesh) {
      this.mesh.cleanup();
      delete this.mesh;
    }

    this.mesh = new Mesh({
      palette: seed.palette,
      seaLevelQuantile: seed.seaLevelQuantile,
    });

    this.mesh.generate(seed.steps, this.onMeshUpdate.bind(this));
  }

  onMeshUpdate(mesh) {
    this.lastMesh = mesh;
    this.render();

    if (this.done && this.forceRerender) {
      this.forceRerender();
    }
  }

  makeGif(callback) {
    if (!this.canvas) {
      return;
    }

    this.timer.stop();

    const imageD = 350;

    const w = this.canvas.getAttribute('width');
    const h = this.canvas.getAttribute('height');

    const gif = new GIF({
      workers: 40,
      quality: 10,
      width: imageD,
      height: imageD,
    });

    for (let i = 0; i < GIF_FRAMES; i++) {
      this.rotate(360 / GIF_FRAMES);
      this.render();

      const fakeCanvas = document.createElement('canvas');
      fakeCanvas.setAttribute('width', imageD);
      fakeCanvas.setAttribute('height', imageD);
      fakeCanvas.getContext('2d').drawImage(
        this.canvas,
        0, 0,
        w, h,
        0, 0,
        imageD, imageD
      );

      gif.addFrame(fakeCanvas, { delay: (4500 / GIF_FRAMES) });
    }

    gif.on('finished', (blob) => {
      callback(URL.createObjectURL(blob));
      this.timer.restart(this.tick.bind(this));
    });

    gif.render();
  }

  attach(canvas, forceRerender) {
    this.forceRerender = forceRerender;

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

  scale(width, height) {
    this.width = width || parseFloat(this.canvas.getAttribute('width'));
    this.height = height || parseFloat(this.canvas.getAttribute('height'));

    this.projection
      .scale(0.7 * Math.min(this.width, this.height) / 2)
      .translate([this.width / 2, this.height / 2]);
  }

  detach() {
    if (this.timer) {
      this.timer.stop();
      delete this.timer;
    }

    if (this.mesh) {
      this.mesh.cleanup();
    }
  }

  reset() {
    this.lastMesh = {};
  }

  dragStart() {
    window.clearTimeout(this.dragTimeout);
    this.isRotating = false;

    this.lastDragStart = this.projection.invert(mouse(this.canvas));
    this.lastDragStartRotation = this.projection.rotate();
  }

  dragging() {
    const position = this.projection.invert(mouse(this.canvas));
    const rotation = this.projection.rotate();
    this.lastDragRotation = rotation;

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
    this.lastDragRotation = null;
    this.lastDragStartRotation = null;
    this.dragTimeout = window.setTimeout(() => {
      this.isRotating = true;
    }, 0);
  }

  tick(elapsed) {
    const thisTime = now();

    if (this.isRotating && this.rotateDirection) {
      const diff = thisTime - this.lastTime;

      if (diff < elapsed) {
        this.rotate(diff * AUTOROTATE_SPEED);
      }
    }

    this.lastTime = thisTime;

    this.render();
  }

  rotate(amt) {
    const rotation = this.projection.rotate();
    rotation[0] += amt * this.rotateDirection[0];
    rotation[1] += amt * this.rotateDirection[1];
    rotation[2] += amt * this.rotateDirection[2];
    this.projection.rotate(rotation);
  }

  render() {
    if (!this.ctx) {
      return;
    }

    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!this.lastMesh.tiles) {
      this.fill({type: 'Sphere'}, '#000');
      return;
    };

    Object.keys(this.lastMesh.tilesByColor).forEach((color) => {
      const tiles = this.lastMesh.tilesByColor[color];
      this.fillAndStroke(tiles, color);
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

  stroke(object, color, lineWidth = 1) {
    this.ctx.beginPath();
    this.path(object);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }

  get done() {
    return this.lastMesh && this.lastMesh.done;
  }
}

export default Globe;
