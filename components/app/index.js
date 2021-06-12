const Systemic = require('systemic');
const optional = require('optional');
const { join } = require('path');

const manifest = optional(join(process.cwd(), 'manifest.json')) || {};
// eslint-disable-next-line import/no-dynamic-require
const pkg = require(join(process.cwd(), 'package.json'));

module.exports = new Systemic({ name: 'github-pull-request-info' }).add('manifest', manifest).add('pkg', pkg);
