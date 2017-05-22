// All canvases made to be 600 x 600;
const WIDTH = 600;
const HEIGHT = 600;

function getCanvas() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', WIDTH);
  canvas.setAttribute('height', HEIGHT);
  return canvas;
}

function translate(point) {
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

function drawCircle(ctx, center, r, color = '#333') {
  ctx.beginPath();
  ctx.arc(
    center.x,
    center.y,
    r,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

export function drawPoints(points = [], c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  points.forEach((point) => {
    drawCircle(ctx, translate(point), 3);
  });

  return canvas;
}

export function drawMesh(mesh, c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#333';

  mesh.edges.forEach((edge) => {
    const s = translateArray(edge[0]);
    const e = translateArray(edge[1]);

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    ctx.closePath();
  });

  return canvas;
}

export function drawTriangles(mesh, c) {

}
