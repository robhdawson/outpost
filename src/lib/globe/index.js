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

const GIF_FRAMES = 80;

class Globe {
  constructor() {
    window.globe = this;
    this.lastMesh = {};

    this.projection = geoOrthographic().precision(0.1);

    this.timeouts = [];
  }

  generate() {
    const seed = getSeed();

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

    const imageD = 300;

    const w = this.canvas.getAttribute('width');
    const h = this.canvas.getAttribute('height');

    const gif = new GIF({
      workers: 40,
      quality: 8,
      width: imageD,
      height: imageD,
    });

    for (let i = 0; i < GIF_FRAMES; i++) {
      const currentRotation = this.projection.rotate();
      currentRotation[0] += (360 / GIF_FRAMES);
      this.projection.rotate(currentRotation);
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

      gif.addFrame(fakeCanvas, { delay: (3500 / GIF_FRAMES) });
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
    this.lastMesh = {};
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
    if (!this.ctx) {
      return;
    }

    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!this.lastMesh.tiles) {
      this.fill({type: 'Sphere'}, '#000');
      return;
    };

    this.lastMesh.tiles.forEach((tile) => {
      this.fillAndStroke(tile, tile.properties.color);
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
