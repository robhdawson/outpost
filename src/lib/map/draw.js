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

export function drawPoints(points = []) {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');

  points.forEach((point) => {
    drawCircle(ctx, translate(point), 3);
  });

  return canvas.toDataURL();
}

export function drawMesh(mesh, points = null) {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333';

  mesh.edges.forEach((edge) => {
    const s = translate({x: edge[0][0], y: edge[0][1]});
    const e = translate({x: edge[1][0], y: edge[1][1]});

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    ctx.closePath();
  });

  if (points) {
    points.forEach(p => drawCircle(ctx, translate(p), 2));
  }

  return canvas.toDataURL();
}
