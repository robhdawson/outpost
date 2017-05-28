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

  return mergedPaths.map((river) => cleanUp(river));
}

function cleanUp(river) {
  river = river.map(r => r.coords);
  return river;
}
















