const upTo = (n, str) => {
  let s = '';
  const a = [];
  for (let i = 0; i < n; i++) {
    s = s + str;
    a.push(s.slice(0));
  }

  return a;
}

const title = (str) => {
  return str.split(' ').map(s => s.length ? s[0].toUpperCase() + s.slice(1) : s).join(' ');
}

const hilo = {
  fillers: {
    V: [
      'a', 'e', 'i', 'o', 'u',
      'a', 'e', 'i', 'o', 'u',
      'a', 'e', 'i', 'o', 'u',
      'a', 'e', 'i', 'o', 'u',
      'a', 'e', 'i', 'o', 'u',
      'ā', 'ē', 'ī', 'ō', 'ū',
    ],
    C: ['p', 'k', 't', 'h', '\'', 'm', 'n', 'l', 'w'],
    cons: ['$V', '$C$V', '$C$V', '$C$V', '$C$V', '$C$V']
  },
  templates: upTo(4, '$cons').concat([
    '$cons$cons',
    '$cons$cons',
    '$cons$cons $cons',
    '$cons $cons$cons',
  ]),
  fix: (s) => title(s.replace(/^'| '/g, '')),
};


const eV = ['a', 'e', 'i', 'o', 'u'];
const eC = [
  'p', 'b', 't', 'd', 'k', 'g', 'ch', 'j',
  'f', 'v', 'th', 's', 'z', 'm', 'n', 'r',
  'l', 'w', 'y'
];

const englidge = {
  fillers: {
    V: eV,
    C: eC,
    C1: eC.concat(eC).concat([
      'h', 'pl', 'bl', 'kl', 'gl', 'pr', 'br', 'tr', 'tw',
      'dr', 'cr', 'gr', 'fl', 'sl', 'fr', 'thr',
      'shr', 'thw', 'sp', 'st', 'sk', 'sm', 'sn',
      'spl', 'skl', 'spr', 'str'
    ]),
    C2: eC.concat(eC).concat([
      'ng', 'lp', 'lb', 'ldge', 'lk', 'lch',
      'rp', 'rb', 'rt', 'rd', 'rch', 'rj', 'rk',
      'rg', 'lm', 'ln', 'rf', 'rv', 'rth', 'rs', 'rsh',
      'mph', 'mth', 'nth', 'ns', 'nz', 'ngth', 'lpt',
      'lps', 'lfth', 'ltz', 'lst', 'mpt', 'mps', 'ndth'
    ]),
  },
  templates: [
    '$C1$V$C2', '$C1$V$C2$V', '$C1$V$C2$V$C2',
    '$C1$V$C2', '$C1$V$C2$V', '$C1$V$C2$V$C2',
    '$C1$V$C2$V', '$C1$V$C2$V$C2',
    '$C1$V$C2$V$C2$V', '$C1$V$C2$V$C2$V',
    '$C1$V$C2$V $C1$V', '$C1$V$C2$V $C1$V$C2',
  ],
  fix: (s) => {
    const f = s
      .replace(/j\b/g, 'dge')
      .replace(/([mn]z)\b/g, '$1e')
      .replace(/(a)a+/g, '$1')
      .replace(/(i)i+/g, '$1')
      .replace(/(u)u+/g, '$1')
      .replace(/(ee)e+/g, '$1')
      .replace(/(oo)o+/g, '$1')
    return title(f);
  },
};

const jingtia = {
  fillers: {
    I: [
      '', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k',
      'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's',
      'hs', 'zs', 'bh',
    ],
    F: [
      'i', 'a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang',
      'eng', 'ia', 'io', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing',
      'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang', 'ong', 'ung',
      'ieh', 'ø', 'øn', 'ep', 'ip', 'iok', 'ok', 'uok',
    ],
    W: ['$I$F \' '],
  },
  templates: ['$W$W', '$W$W', '$W$W', '$W$W $W', '$W $W'],
  fix: (s) => {
    const f = s
      .replace(/\bi/g, 'y')
      .replace(/\bu/g, 'w')
      .replace(/ \' ([aeiouøœæ])/g, '\'$1')
      .replace(/ \' /g, '')
    return title(f);
  },
}

const wozki = {
  fillers: {
    V: [
      'i', 'e', 'y', 'a', 'u', 'o',
      'i', 'e', 'y', 'a', 'u', 'o',
      'i', 'e', 'y', 'a', 'u', 'o',
      'ę', 'į', 'ą'
    ],
    C: [
      's', 'z', 'š', 'ž', 't', 'd', 'c', 'č',
      'm', 'n', 'b', 'p', 'r', 'k', 'l',
      'd', 'b', 'l', 'm'
    ],
    s: ['s', 'z', 'š', 'ž', 'č', 's', 'z', 's', 's'],
    t: ['t', 'd', 'b', 'p', 'k'],
    m: ['m', 'n', 'l'],

    K: [
      '$C', '$C', '$C',
      '$s | $t', '$s | $m',
      '$m | $t', '$s | $m | $t',
    ],
  },
  templates: [
    '$K | $V | $C', '$K | $V | $K | $V',
    '$K | $V | $K | $V | $C', '$K | $V | $K | $V | $K | $V',
    '$K | $V | $K | $V | $K | $V | $C',
    '$K | $V | $K | $V | $C $K | $V | $K | $V | $C',
  ],
  fix: (s) => {
    const f = s;

    return title(f);
  },
}

module.exports = [
  hilo,
  englidge,
  jingtia,
  wozki,
];


