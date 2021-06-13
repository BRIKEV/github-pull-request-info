module.exports = () => {
  const start = async ({ logger, github, store }) => {
    const getPRs = async (owner, repository) => {
      logger.info(`Retrieving PRs from repository ${owner}/${repository}...`);
      const { data: githubInfo } = await github.getPRs({
        params: {
          state: 'closed',
          direction: 'desc',
        },
        urlParams: {
          owner,
          repository,
        },
      });
      return githubInfo;
    };

    const userPayload = user => ({
      username: user.login,
      avatar_url: user.avatar_url,
      id: user.id,
      url: user.url,
    });

    const saveNonReviewers = async (prId, nonReviewers) => {
      logger.info(`Saving PR (${prId}) ${nonReviewers.length} no reviewer users`);
      const saveRequest = nonReviewers.map(nonReviewer => (
        Promise.all([
          store.upsertUser(userPayload(nonReviewer)),
          store.saveNonReviewers({
            prId,
            userId: nonReviewer.id,
            status: 'NO_REVIEWED',
            review_quality: 'MISSING',
          }),
        ])
      ));
      return Promise.all(saveRequest);
    };

    const processPR = async prInfo => {
      // Save reviewers do not review
      await saveNonReviewers(prInfo.requested_reviewers);
      // GET PR Detail & save PR info

      // Get reviews endpoint and save that info
    };

    const saveProjectInfo = async (owner, repository, project) => {
      logger.info(`Saving repository ${owner}/${repository}`);
      if (!project) {
        return logger.info('there are no project to process');
      }
      const repoDetails = {
        id: project.base.repo.id,
        name: project.base.repo.name,
        owner_id: project.base.repo.owner.id,
      };
      const ownerDetails = {
        id: project.base.repo.owner.id,
        name: project.base.repo.owner.login,
        type: project.base.repo.owner.type,
      };
      return store.saveProjectInfo(repoDetails, ownerDetails);
    };

    const digestRepo = async (owner, repository) => {
      logger.info(`Digesting repository ${owner}/${repository}`);
      const prs = await getPRs(owner, repository);
      await saveProjectInfo(owner, repository, prs[0]);
      // const processPRs = prs.map(processPR);
      // return Promise.all(processPRs);
    };
    return { digestRepo };
  };
  return { start };
};
