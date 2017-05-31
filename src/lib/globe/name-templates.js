const sharedFillers = {
    omega: [
        'omega', 'alpha', 'beta',
    ],
    prime: [
        'prime', 'II', 'III', 'IV', 'V', 'VI', 'VII',
    ],
    kingdom: [
        'emperion', 'empire', 'domain', 'dominion',
        'imperium', 'imperion', 'realm', 'colonies',
        'authority', 'federation',
    ],
    fancyName: ['$grembulon'],

    grembulon: [
        '$gr | $em | $b',
        '$gr | $em | $b | $o',
        '$gr | $em | $b | $o | $lon',
    ],
    dinkus: ['$dink | $us', '$dink', '$dink | $em'],
    bing: ['$dink', '$bong'],
    dink: ['$d | $un | $k', '$un | $k'],
    bong: ['$b | $o | $ng'],

    d: [
        'd', 'g', 'b',
    ],
    b: [
        'b', 'p', 'pt',
    ],
    gr: [
        'gr', 'kr', 'gl', 'g\'', 'fl', 'fr', 'ph', 'r', 'l',
    ],
    lon: ['lon', 'lonne', 'lum', 'lox', 'lux', 'lyx', 'lym', 'trom', 'trolle'],
    em: [
        'em', 'om', 'yn', 'oy', 'oym', 'uym', 'eym', 'e', 'ae', 'aem', 'aen',
    ],
    un: [
        'un', 'ung\'', 'on', 'om', 'eee', 'u', 'ou',
    ],
    ng: ['ng', 'm', 'n', 'll', 'lle'],
    k: [
        'k', 'ck', 'g', 'gg', 'd', 'x',
    ],
    us: [
        'us', 'oos', 'uss', 'uz', 'oz', 'ouz', 'ousse',
    ],
    o: ['o', 'u', 'ou', 'ü', 'ò', 'oe', 'oi'],
};

export const planet = {
    templates: [
        '$omega $bing',
        '$dinkus',
        '$dinkus $prime',
    ],
    fillers: sharedFillers,
}

export const sector = {
    templates: [
        '$fancyName $kingdom',
    ],
    fillers: sharedFillers,
};

export const system = {
    templates: ['$fancyName'],
    fillers: sharedFillers,
};



