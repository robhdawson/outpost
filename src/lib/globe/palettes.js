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

    purple: {
        deepWater: '#3a283d',
        midWater: '#603168',
        shallowWater: '#95719b',
    },
};

const lands = {
    brown: {
        beach: '#a39984',
        forest: '#cec8ab',
        peakStart: '#ccc8b9',
        peak: '#fffff8',
    },

    orangey: {
        beach: '#7a5403',
        forest: '#b79550',
        peakStart: '#dddbaf',
        peak: '#f2f0d7',
    },

    greens: {
        beach: '#a8a488',
        forest: '#617759',
        peakStart: '#848e81',
        peak: '#ced8cb',
    },
};

export function randomPalette() {
    return merge(sample(waters), sample(lands));
}
