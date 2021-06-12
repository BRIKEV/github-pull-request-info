const Systemic = require('systemic');
const adminRoutes = require('./admin-routes');

module.exports = new Systemic({ name: 'routes' })
  .add('routes.admin', adminRoutes())
  .dependsOn('config', 'logger', 'app', 'middleware.prepper', 'manifest')
  .add('routes')
  .dependsOn('routes.admin');
