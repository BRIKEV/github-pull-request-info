const Systemic = require('systemic');
const { join } = require('path');

// Use dotenv to allow retrieving env variables from local .env file
require('dotenv').config();

module.exports = () => new Systemic({ name: 'github-pull-request-info' })
  .bootstrap(join(__dirname, 'components'));
