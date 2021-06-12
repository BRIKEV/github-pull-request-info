const { join } = require('path');
const Systemic = require('systemic');

const controllers = require('require-all')(join(__dirname, 'controllers'));

module.exports = new Systemic({ name: 'github' })
  .add('controller', controllers.digest())
  .dependsOn('config', 'logger', 'github')
  .add('controller')
  .dependsOn({
    component: 'controller.digest',
    destination: 'product',
  });
