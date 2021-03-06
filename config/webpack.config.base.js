const paths = require('./paths');

module.exports = {
    resolve: {
        alias: {
            components: paths.components,
            store: paths.store,
            lib: paths.lib,
        },
    },
};
