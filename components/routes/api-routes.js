const {
  handleHttpError,
  tagError,
} = require('error-handler-module');
const { validateRequest } = require('express-oas-validator');

module.exports = () => {
  const start = async ({ app, logger, controller }) => {
    /**
     * Request params to digest a repository in our systems
     * @typedef {object} DigestRequest
     * @property {string} org.required - Organization or user github name
     * @property {string} repo.required - repository name
     */

    /**
     * POST /api/v1/repository/digest
     * @description Digest repository and org in our DB
     * @summary summary
     * @param {DigestRequest} request.body.required - repository and org
     * @return {object} 200 - process repository success
     */
    app.post('/api/v1/repository/digest', validateRequest(), async (req, res, next) => {
      try {
        const { org, repo } = req.body;
        await controller.digest.digestRepo(org, repo);
        return res.json({ success: true });
      } catch (err) {
        return next(tagError(err));
      }
    });

    app.use(handleHttpError(logger));

    return Promise.resolve();
  };

  return { start };
};
