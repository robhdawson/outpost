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

function drawPoints(points = [], { color = '#333', r = 2 }, c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  points.forEach((point) => {
    drawCircle(ctx, translate(point), r, color);
  });

  return canvas;
}

function drawLines(lines, { color = '#333', lineWidth = 1 }, c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;

  lines.forEach((line) => {
    const s = translate(line[0]);
    const e = translate(line[1]);

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    ctx.closePath();
  });
}

export function drawMesh(mesh, c) {
  let canvas = c || getCanvas();

  drawLines(mesh.triangleEdges(), {color: '#333'}, canvas);
  // drawLines(mesh.polygonEdges(), {color: '#ccc'}, canvas);

  // drawPoints(mesh.centers, {color: '#c00', r: 3}, canvas);
  // drawPoints(mesh.corners, {color: '#00c', r: 4}, canvas);

  return canvas;
}
