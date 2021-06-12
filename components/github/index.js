const System = require('systemic');
const initGithub = require('./initGithub');

module.exports = new System({ name: 'github' })
  .add('github', initGithub())
  .dependsOn('config', 'logger');
