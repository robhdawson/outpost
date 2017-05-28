import {
  geoOrthographic,
  geoPath,
  timer,
  now,
  scaleLinear,
  select,
  drag,
  event as d3Event,
  min,
  max,
} from 'd3';

import Mesh from './mesh';

const colors = {
  space: '#ffffff',
  water: '#aaaaee',
};

const AUTOROTATE_SPEED = 0.005; // degrees per ms

const meshSteps = [
  ['addMountains', 3, 1, 0.7],
  ['addMountains', 10, 0.7],
  ['addMountains', 13, 0.6],
  ['addMountains', 40, 0.5],
  ['addMountains', 50, 0.4, 3],
  ['addMountains', 5, 1, 0.5],

  ['normalizeHeights'],

];

class Globe {
  constructor() {
    window.globe = this;

    this.mesh = new Mesh();

    this.projection = geoOrthographic().precision(0.1);
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
  }

  dragStart() {
    this.isRotating = false;
  }

  dragging() {
    this.projection.rotate([this.rotateScaleX(d3Event.x), this.rotateScaleY(d3Event.y)]);
  }

  dragEnd() {
    this.isRotating = true;
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

    this.fill({type: 'Sphere'}, '#333');

    const heights = this.mesh.triangles.map(t => t.properties.height);

    const colorScale = scaleLinear().domain([min(heights), max(heights)]).range(['#333', '#efefef']);
    this.mesh.triangles.forEach((triangle) => {
      this.fill(triangle, colorScale(triangle.properties.height));
    });

    // const d = 0.1;
    // const dots = {
    //   type: 'GeometryCollection',
    //   geometries: [],
    // };

    // this.mesh.points.forEach((point) => {
    //   const shape = {
    //     type: 'Polygon',
    //     coordinates: [
    //       [
    //         [point[0] - d, point[1] - d],
    //         [point[0] + d, point[1] - d],
    //         [point[0] + d, point[1] + d],
    //         [point[0] - d, point[1] + d],
    //         [point[0] - d, point[1] - d],
    //       ],
    //     ],
    //   };

    //   dots.geometries.push(shape);
    // });

    // this.stroke(dots, '#811');
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
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
  }

  generate() {
    this.mesh = new Mesh();
    window.setTimeout(() => {
      this.mesh.generate();
      this.generateSteps();
    }, 0);
  }

  generateSteps() {
    meshSteps.forEach((step, i) => {
      window.setTimeout(() => {
        this.mesh[step[0]].apply(this.mesh, step.slice(1));
      }, 1000 * i);
    });
  }
}

export default Globe;
