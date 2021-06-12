const System = require('systemic');
const { join } = require('path');

module.exports = () => new System({ name: 'github-pull-request-info' })
  .bootstrap(join(__dirname, 'components'));
