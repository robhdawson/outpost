import { max, min, scaleLinear } from 'd3';

// All canvases made to be 1200 x 1200;
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
    const v1 = translate(shape.vertices[1]);
    const v2 = translate(shape.vertices[2]);

    ctx.beginPath();
    ctx.moveTo(v0.x, v0.y);
    ctx.lineTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.lineTo(v0.x, v0.y);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  });

  return canvas;
}

export function drawMesh(mesh, c) {
  const canvas = c || getCanvas();

  // draw fluxmap

  // if (mesh.points[0].flux) {
  //   const fluxes = mesh.points.map(p => p.flux);
  //   const minF = min(fluxes);
  //   const maxF = max(fluxes);

  //   const colorScale = scaleLinear()
  //     .domain([minF, maxF])
  //     .range(['#eee', '#e11']);

  //   console.log(minF, maxF);

  //   const colorForTriangle = (shape) => {
  //     if (shape.center.height < mesh.seaLevel) {
  //       return '#444';
  //     } else {
  //       return colorScale(shape.center.flux);
  //     }
  //   }
  //   fillShapes(
  //     mesh.triangles(),
  //     colorForTriangle,
  //     canvas
  //   );
  // }

  // draw heightmap

  const heights = mesh.points.map(p => p.height);
  const minH = min(heights);
  const maxH = max(heights);

  let colorForTriangle;

  if (mesh.isFlat()) {
    colorForTriangle = () => '#6e6d9e';
  } else {
    const colorScale = scaleLinear()
      .domain([minH,      mesh.justBelowSeaLevel, mesh.seaLevel, mesh.justAboveSeaLevel, maxH])
      .range( ['#04023f', '#646291',              '#7A7980',     '#938e6d',              '#fdfff4']);

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
    // drawLines(mesh.downhillLines(), { color: '#1d1', lineWidth: 1 }, canvas);
    // drawPoints(mesh.points.filter(p => !p.downhill), { color: '#1d1', r: 5}, canvas);
    drawLines(mesh.rivers, { color: '#6d6b91', lineWidth: 2 }, canvas);
    // drawLines(mesh.rivers, { color: '#1e1', lineWidth: 6 }, canvas);
  }

  // drawLines(mesh.downhillLines(), { color: '#d11', lineWidth: 1 }, canvas);

  // const fluxes = mesh.points.map(p => p.flux);
  // const fluxScale = scaleLinear()
  //   .domain([0, max(fluxes)])
  //   .range([2, 4]);

  // const ctx = canvas.getContext('2d');
  // mesh.points.forEach((point) => {
  //   drawCircle(ctx, translate(point), fluxScale(point.flux), '#1e1');
  // });
  // drawLines(mesh.triangleEdges(), {color: '#111'}, canvas);


  // drawLines(mesh.polygonEdges(), {color: '#ccc'}, canvas);

  // drawPoints(mesh.polygonCenters, {color: '#c00', r: 3}, canvas);
  // drawPoints(mesh.points, {color: '#00c', r: 4}, canvas);

  return canvas;
}
