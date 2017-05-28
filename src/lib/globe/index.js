import {
  geoOrthographic,
  geoGraticule10,
  geoPath,
  timer,
  now,
} from 'd3';

const colors = {
  space: '#ffffff',
  water: '#aaaaee',
};

const AUTOROTATE_SPEED = 0.005; // degrees per ms

class Globe {
  constructor() {
    window.globe = this;

    this.projection = geoOrthographic().precision(0.1);
    this.graticule = geoGraticule10();
  }

  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const width = this.width = parseFloat(canvas.getAttribute('width'));
    const height = this.height = parseFloat(canvas.getAttribute('height'));

    this.projection
      .scale(0.9 * Math.min(width, height) / 2)
      .translate([width / 2, height / 2]);


    this.path = geoPath(this.projection).context(this.ctx);
    this.lastTime = now();

    this.timer = timer(this.tick.bind(this));
  }

  detach() {
    if (this.timer) {
      this.timer.stop();
      delete this.timer;
    }
  }

  tick(elapsed) {
    const thisTime = now();
    const diff = thisTime - this.lastTime;

    if (diff < elapsed) {
      const currentRotation = this.projection.rotate();
      currentRotation[0] += diff * AUTOROTATE_SPEED;
      this.projection.rotate(currentRotation);
    }

    this.lastTime = thisTime;

    this.render();
  }

  render() {




    this.ctx.fillStyle = colors.space;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.fill({type: 'Sphere'}, colors.water);
    this.stroke(this.graticule, colors.space);
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

  }
}

export default Globe;
