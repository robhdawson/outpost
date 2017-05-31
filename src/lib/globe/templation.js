const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const fill = (template, fillers) => {
    var done = true;
    var parts = template.split(' ');
    var newParts = [];
    parts.forEach(function(part) {
        if (part[0] === '$') {
            var fillerKey;
            if (part[part.length - 1] === '?') {
                if (Math.random() < 0.5) {
                    return;
                }

                fillerKey = part.slice(1, part.length - 1);
            } else {
                fillerKey =  part.slice(1);
            }

            newParts.push(rand(fillers[fillerKey]));
            done = false;
        } else {
            newParts.push(part);
        }
    });
    var reAssembled = newParts.join(' ');
    if (done) {
        return clean(reAssembled);
    } else {
        return fill(reAssembled, fillers);
    }
}

function clean(string) {
    return string.replace(/ ?\| ?/g, '');
}

function random(info) {
    var template = rand(info.templates);
    return fill(template, info.fillers);
}

export default random;
