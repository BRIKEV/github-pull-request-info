const requests = require('config-req');

module.exports = () => {
  const start = async ({ config }) => {
    const api = requests(config.api);
    return api;
  };

  return { start };
};
