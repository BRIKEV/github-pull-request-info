const Systemic = require('systemic');
const confabulous = require('./confabulous');

module.exports = new Systemic({ name: 'config' }).add('config', confabulous(), { scoped: true });
