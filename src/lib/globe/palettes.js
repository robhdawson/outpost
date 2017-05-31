function merge(a, b) {
    return Object.assign({}, a, b);
}

function sample(obj) {
    const keys = Object.keys(obj);
    const key = keys[Math.floor(Math.random() * keys.length)];
    return obj[key];
}

const waters = {
    blue: {
        deepWater: '#302e66',
        midWater: '#4f4f7f',
        shallowWater: '#8b8aad',
    },

    grayBlue: {
        deepWater: '#303030',
        midWater: '#4d5b66',
        shallowWater: '#6e8aa0',
    },

    red: {
        deepWater: '#5b0f0f',
        midWater: '#8e3b52',
        shallowWater: '#ba776f',
    },

    pink: {
        deepWater: '#5b0e41',
        midWater: '#8c326d',
        shallowWater: '#995d84',
    },

    purple: {
        deepWater: '#3a283d',
        midWater: '#603168',
        shallowWater: '#95719b',
    },

    teal: {
        deepWater: '#0eaf8c',
        midWater: '#17eabc',
        shallowWater: '#c9e5df',
    },

    black: {
        deepWater: '#262626',
        midWater: '#383838',
        shallowWater: '#707070',
    },
};

const lands = {
    tan: {
        beach: '#a39984',
        forest: '#cec8ab',
        peakStart: '#ccc8b9',
        peak: '#fffff8',
    },

    orangey: {
        beach: '#917335',
        forest: '#bc9443',
        peakStart: '#ddd1af',
        peak: '#f1ebd6',
    },

    mustard: {
        beach: '#879135',
        forest: '#b0bc43',
        peakStart: '#d5ddaf',
        peak: '#ebf1d6',
    },

    dullGreen: {
        beach: '#a8a488',
        forest: '#617759',
        peakStart: '#848e81',
        peak: '#ced8cb',
    },

    richerGreen: {
        beach: '#449135',
        forest: '#57bc43',
        peakStart: '#b3ddaf',
        peak: '#d8f1d6',
    },

    blueyGreen: {
        beach: '#538463',
        forest: '#236839',
        peakStart: '#377a5e',
        peak: '#8fc1ac',
    },
};

export function randomPalette() {
    return merge(sample(waters), sample(lands));
}
