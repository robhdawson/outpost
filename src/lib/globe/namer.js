import randFromTemplate from './templation';
import languages from './languages';

const namer = () => {
  const lang = languages[Math.floor(Math.random() * languages.length)];

  return {
    planet: lang.fix(randFromTemplate(lang)),
    sector: lang.fix(randFromTemplate(lang) + ' sector'),
    system: lang.fix(randFromTemplate(lang) + ' system'),
  };
}

export default namer;
