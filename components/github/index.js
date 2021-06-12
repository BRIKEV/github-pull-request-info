const Systemic = require('systemic');
const initGithub = require('./initGithub');

module.exports = new Systemic({ name: 'github' })
  .add('github', initGithub())
  .dependsOn('config', 'logger');
