onmessage = function(e) {
  if (e.data.type === 'step') {
    const step = e.data.step;
    const stepName = step[0];
    const stepArgs = step.slice(1);

    const stepIndex = e.data.index;

    const mesh = e.data.mesh || {};

    if (steps[stepName]) {
      console.log(`Performing step: ${stepName}`);
      steps[stepName].apply(mesh, stepArgs);

      postMessage({
        nextStep: stepIndex + 1,
        mesh: mesh,
      });
    } else {
      console.log(`Unknown step: ${stepName}`);
    }
  }


  // console.log('Posting message back to main script');
  // postMessage(workerResult);
}

const steps = {
  getPoints: function(numberOfPoints = 5400) {
    const points = [];

    // doing the fibonacci spiral sphere thing
    const phi = ((Math.sqrt(5) + 1) / 2) - 1; // golden ratio
    const ga = phi * 2 * Math.PI;           // golden angle

    const w = degreesToRadians(4);
    const wiggle = () => (Math.random() * w) - (w / 2);

    for(let i = 0; i < numberOfPoints; i++) {
      let lon = (ga * i) + wiggle();

      while (lon > Math.PI) {
        lon = lon - (Math.PI * 2);
      }

      const lat = Math.asin(-1 + ((2 * i) / numberOfPoints)) + wiggle();

      // geojson is lon,lat!!! don't forget this or u will die
      points.push([
        radiansToDegrees(lon),
        radiansToDegrees(lat),
      ]);
    }

    this.points = points;
  }
}


function radiansToDegrees(x) {
  return x * 180 / Math.PI
};

function degreesToRadians(x) {
  return x * (Math.PI/180)
};

function distance(a, b) {
  const lonA = a[0];
  const lonB = b[0];
  const latA = a[1];
  const latB = b[1];

  const dLat = degreesToRadians(latB - latA);
  const dLon = degreesToRadians(lonB - lonA);

  const n =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(latA)) * Math.cos(degreesToRadians(latB)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
  return c;
}

function randomPoint() {
  // cos-1(2x - 1), where x is uniformly distributed and x ∈ [0, 1)

  const lon = (Math.random() * 360) - 180;

  const latThing = Math.random();
  const lat = radiansToDegrees(Math.acos((2 * latThing) - 1)) - 90;
  return [lon, lat];
}
