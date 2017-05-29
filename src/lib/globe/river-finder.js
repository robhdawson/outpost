export default function findRivers(tiles, seaLevel = 0, threshold = 0.01) {
  const land = tiles.filter((tile) => {
    return tile.properties.height > seaLevel;
  });

  land.sort((a, b) => b.properties.flux - a.properties.flux);

  const limit = threshold * (land.length / tiles.length);

  const links = [];

  tiles.forEach((tile) => {
    const props = tile.properties;

    if (
      props.flux <= limit ||
      props.height <= seaLevel ||
      !props.downhill
    ) {
      return;
    }

    tile.properties.hasRiver = true;
    tile.properties.downhill.properties.hasRiver = true;

    const link = {
      up: {
        tile,
        coords: props.center,
      },
      down: {
        tile: props.downhill,
        coords: props.downhill.properties.center,
      }
    };

    if (props.downhill.height <= seaLevel) {
      link.down.coords = [
        (props.center[0] + props.downhill.properties.center[0]) / 2,
        (props.center[1] + props.downhill.properties.center[1]) / 2
      ];
    }

    links.push(link);
  });


  const adjacents = {};

  links.forEach((link) => {
    adjacents[link.up.tile.properties.id] = adjacents[link.up.tile.properties.id] || [];
    adjacents[link.down.tile.properties.id] = adjacents[link.down.tile.properties.id] || [];

    adjacents[link.up.tile.properties.id].push(link.down);
    adjacents[link.down.tile.properties.id].push(link.up);
  });

  let currentPath = null;
  const mergedPaths = [];

  while (true) {
    if (currentPath === null) {
      for(let j = 0; j < links.length; j++) {
        const link = links[j];
        if (link.merged) {
          continue;
        }

        link.merged = true;
        currentPath = [link.up, link.down];
        break;
      };

      if (currentPath === null) {
        break;
      }
    }

    let changed = false;
    for (let k = 0; k < links.length; k++) {
      const link = links[k];

      if (link.merged) {
        continue;
      }

      const pathStart = currentPath[0];
      const pathEnd = currentPath[currentPath.length - 1];

      if (
        adjacents[pathStart.tile.properties.id].length === 2 &&
        link.up === pathStart
      ) {
        currentPath.unshift(link.down);
      } else if (
        adjacents[pathStart.tile.properties.id].length === 2 &&
        link.down === pathStart
      ) {
        currentPath.unshift(link.up);
      } else if (
        adjacents[pathEnd.tile.properties.id].length === 2 &&
        link.up === pathEnd
      ) {
        currentPath.push(link.down);
      } else if (
        adjacents[pathEnd.tile.properties.id].length === 2 &&
        link.down === pathEnd
      ) {
        currentPath.push(link.up);
      } else {
        // no dice
        continue;
      }

      link.merged = true;
      changed = true;
      break;
    }

    if (!changed) {
      mergedPaths.push(currentPath);
      currentPath = null;
    }
  }

  return mergedPaths.map((river) => river.map(l => l.coords));
}

// function cleanUp(river, seaLevel) {
//   const path = [];

//   const tiles = river.map(r => r.tile);

//   let i = 0;

//   const isAboveSeaLevel = (t) => t.properties.height > seaLevel;
//   const notOnPath = (c) => !path.includes(c.coords);
//   const onCurrentTile = (c) => c.touches.includes(tiles[i]);
//   const onNextTile = (c) => c.touches.includes(tiles[i + 1]);

//   const goodStartingCorner = (c) => {
//     return c.touches.filter(isAboveSeaLevel).length === c.touches.length;
//   };

//   const getClosestToNext = (c) => {
//     let best = null;
//     let bestDistance = Infinity;

//     let avail = c.adjacent.filter(notOnPath).filter(onNextTile);
//     if (avail.length === 0) {
//       avail = c.adjacent.filter(notOnPath).filter(onCurrentTile);
//     }

//     const nextCenter = tiles[i + 1].properties.center;

//     if (avail.length === 0) {
//       console.log('im dying');
//       return best;
//     }

//     avail.forEach((a) => {
//       const d = distance(a.coords, nextCenter);

//       if (d < bestDistance) {
//         best = a;
//         bestDistance = d;
//       }
//     });

//     return best;
//   }

//   const goodCorners = river[0].tile.properties.corners.filter(goodStartingCorner);
//   window.river = river;

//   if (goodCorners.length === 0) {
//     return path;
//   }

//   let currentCorner = sample(goodCorners);

//   path.push(currentCorner.coords);

//   while(true) {
//     if (i === river.length - 1) {
//       // might be done
//       if (currentCorner.touches.filter(isAboveSeaLevel).length < currentCorner.touches.length) {
//         break;
//       } else {
//         const avail = currentCorner.adjacent.filter(a => onCurrentTile(a) && notOnPath(a));

//         if (avail.length === 0) {
//           console.log('hmmm');
//           break;
//         }

//         currentCorner = sample(avail);
//         path.push(currentCorner.coords);
//         continue;
//       }
//     }

//     currentCorner = getClosestToNext(currentCorner);
//     if (!currentCorner) {
//       console.log('AHHH');
//       break;
//     }

//     if (onNextTile(currentCorner)) {
//       i++;
//     }

//     path.push(currentCorner.coords);
//   }

//   return path;
// }

// function sample(array) {
//   return array[Math.floor(Math.random() * array.length)];
// }

// function distance(a, b) {
//   const lonA = a[0];
//   const lonB = b[0];
//   const latA = a[1];
//   const latB = b[1];

//   const dLat = degreesToRadians(latB - latA);
//   const dLon = degreesToRadians(lonB - lonA);

//   const n =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(degreesToRadians(latA)) * Math.cos(degreesToRadians(latB)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   var c = 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
//   return c;
// }

// function degreesToRadians(x) {
//   return x * (Math.PI/180)
// };








