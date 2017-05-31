import randFromTemplate from './templation';

import { planet, sector, system } from './name-templates';

const planetName = () => {
  return randFromTemplate(planet);
}

const sectorName = () => {
  return randFromTemplate(sector);
}

const systemName = () => {
  return randFromTemplate(system) + ' system';
}

const namer = () => {
  return {
    planet: planetName(),
    sector: sectorName(),
    system: systemName(),
  }
}

export default namer;
