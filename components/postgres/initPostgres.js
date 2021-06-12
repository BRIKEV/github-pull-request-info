const initHandyPg = require('handy-postgres');
const extendHandyPg = require('./extendPostgres');

module.exports = ({ configPath }) => {
  let handyPg;

  const start = async ({ config, logger }) => {
    handyPg = initHandyPg({ logger, configPath });
    const pgAPI = await handyPg.start(config);

    // Add additional features to the base pgAPI
    const extendedPgAPI = extendHandyPg(pgAPI);

    return {
      ...extendedPgAPI,
      schema: config.schema,
    };
  };

  const stop = () => handyPg.stop();

  return { start, stop };
};
