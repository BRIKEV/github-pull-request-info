const Systemic = require('systemic');
const initStore = require('./initStore');

module.exports = new Systemic({ name: 'store' })
  .add('store', initStore())
  .dependsOn('config', 'logger', 'pg');
