import { scaleLinear, quantile } from 'd3';
import StackBlur from 'stackblur-canvas';

// All canvases made to be 1200 x 1200 - good for retina
const WIDTH = 1200;
const HEIGHT = 1200;


const colors = {
  deepWater: '#1b1872',
  midWater: '#4f4f7f',
  shallowWater: '#8b8aad',

  beach: '#a39984',
  forest: '#cec8ab',
  peakStart: '#ccc8b9',
  peak: '#fffff8',

  coastline: '#999277',
  river: '#6d6b91',
};

function fillShapes(shapes, colorCallback, c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  shapes.forEach((shape) => {
    const color = colorCallback(shape)
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const v0 = translate(shape.vertices[0]);

    ctx.beginPath();
    ctx.moveTo(v0.x, v0.y);

    shape.vertices.slice(1).forEach((v) => {
      const vert = translate(v);
      ctx.lineTo(vert.x, vert.y);
    });

    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  });

  return canvas;
}

export function drawMesh(mesh, c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  const heights = mesh.points.map(p => p.height);
  heights.sort((a, b) => a - b);

  const seaHeights = [];
  const landHeights = [];

  heights.forEach((height) => {
    if (height > mesh.seaLevel) {
      landHeights.push(height);
    } else {
      seaHeights.push(height);
    }
  });

  let colorForTriangle;

  if (mesh.isFlat()) {
    colorForTriangle = () => '#6e6d9e';
  } else {
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

    colorForTriangle = (shape) => {
      if (shape.center.height > mesh.seaLevel) {
        return landScale(shape.center.height);
      } else {
        return seaScale(shape.center.height);
      }
    };
  };

  fillShapes(
    mesh.triangles(),
    colorForTriangle,
    canvas
  );

  // blur after filling shapes but before actual lines
  StackBlur.canvasRGBA(canvas, 0, 0, WIDTH, HEIGHT, 3);

  if (mesh.coastline) {
    drawLines(mesh.coastline, { color: colors.coastline, lineWidth: 2 }, canvas);
  }

  if (mesh.rivers) {
    drawLines(mesh.rivers, { color: colors.river, lineWidth: 3, alpha: 0.7 }, canvas);
  }

  // Now crop it
  const pointWidth = WIDTH / Math.sqrt(mesh.points.length);
  const cropPadding = 2.2 * pointWidth;

  ctx.drawImage(
    canvas,
    cropPadding,
    cropPadding,
    WIDTH - (cropPadding * 2),
    HEIGHT - (cropPadding * 2),
    0,
    0,
    WIDTH,
    HEIGHT
  );

  return canvas;
}

function getCanvas() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', WIDTH);
  canvas.setAttribute('height', HEIGHT);
  return canvas;
}

function translate(point) {
  if (Array.isArray(point)) {
    return translateArray(point);
  }

  return {
    x: point.x * WIDTH,
    y: point.y * HEIGHT,
  }
}

function translateArray(point) {
  return translate({
    x: point[0],
    y: point[1],
  });
}

function drawLines(lines, { color = '#333', lineWidth = 2, alpha = 1 }, c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;

  lines.forEach((line) => {
    if (line.length <= 1) {
      return;
    }

    const s = translate(line[0]);

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);

    line.slice(1).forEach((point) => {
      const p = translate(point);
      ctx.lineTo(p.x, p.y);
    })

    ctx.stroke();
    ctx.closePath();
  });

  ctx.globalAlpha = 1;

  return canvas;
}
