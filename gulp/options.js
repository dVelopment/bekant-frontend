var minimist = require('minimist'),
    knownOptions = {
        string: ['env'],
        'default': {
            env: process.env.NODE_ENV || 'development'
        }
    },
    options = minimist(process.argv.slice(2), knownOptions);

module.exports = options;
