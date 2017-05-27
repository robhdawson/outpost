import { max, min, scaleLinear } from 'd3';

// All canvases made to be 1200 x 1200 - good for retina
const WIDTH = 1200;
const HEIGHT = 1200;

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

function drawLines(lines, { color = '#333', lineWidth = 2 }, c) {
  const canvas = c || getCanvas();
  const ctx = canvas.getContext('2d');

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;

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

  return canvas;
}

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

  const heights = mesh.points.map(p => p.height);
  const minH = min(heights);
  const maxH = max(heights);

  let colorForTriangle;

  if (mesh.isFlat()) {
    colorForTriangle = () => '#6e6d9e';
  } else {
    const colorScale = scaleLinear()
      .domain([minH,      mesh.justBelowSeaLevel, mesh.seaLevel, mesh.justAboveSeaLevel, maxH])
      .range( ['#04023f', '#646291',              '#7A7980',     '#938e6d',              '#fffff8']);

    colorForTriangle = (shape) => {
      return colorScale(shape.center.height);
    };
  };

  fillShapes(
    mesh.triangles(),
    colorForTriangle,
    canvas
  );

  if (mesh.coastline) {
    drawLines(mesh.coastline, { color: '#6d6951', lineWidth: 2 }, canvas);
  }

  if (mesh.rivers) {
    drawLines(mesh.rivers, { color: '#6d6b91', lineWidth: 2 }, canvas);
  }

  const borderLines = mesh.edges
    .filter((edge) => {
      return (
        edge.hasCorners && !(
          edge.point0.isTriangle &&
          edge.point1.isTriangle
        )
      );
    })
    .map(e => [e.corner0, e.corner1]);

  drawLines(borderLines, { color: '#47442e', lineWidth: 3 }, canvas);

  return canvas;
}
