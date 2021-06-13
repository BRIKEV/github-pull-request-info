const { filterByState } = require('../../../utils');

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

    const saveReviewers = async (prId, reviewers) => {
      logger.info(`Saving PR (${prId}) ${reviewers.length} no reviewer users`);
      const saveUsers = reviewers.map(async nonReviewer => {
        await store.upsertUser(userPayload(nonReviewer));
      });
      await Promise.all(saveUsers);
      const saveRequest = reviewers.map(async nonReviewer => {
        await store.saveNonReviewers({
          pull_request_id: prId,
          user_id: nonReviewer.id,
          status: nonReviewer.status || 'NO_REVIEWED',
          review_quality: nonReviewer.reviewQuality || 'MISSING',
        });
      });
      return Promise.all(saveRequest);
    };

    const prQuality = (commits, changedFiles, body) => {
      if (body.length === 0) return 'UNACCEPTABLE';
      if (commits === 1 && changedFiles > 50) return 'VERY_HARD';
      if (commits > 1 && changedFiles > 50) return 'HARD';
      if (commits === 1 && changedFiles < 50) return 'MEDIUM_HARD';
      if (commits > 1 && changedFiles < 50) return 'GOOD';
      return 'OK';
    };

    const upsertPRInfo = async (owner, repository, prInfo) => {
      logger.info(`Retrieving PR (${prInfo.number}) details...`);
      const { data: githubPRDetail } = await github.getPRDetail({
        urlParams: {
          owner,
          repository,
          prNumber: prInfo.number,
        },
      });
      // Save owner
      logger.info('Saving PR owner...');
      await store.upsertUser(userPayload(prInfo.user));
      const prData = {
        id: prInfo.id,
        user_id: prInfo.user.id,
        number: prInfo.number,
        state: prInfo.state,
        repository_id: prInfo.base.repo.id,
        commits: githubPRDetail.commits,
        additions: githubPRDetail.additions,
        deletions: githubPRDetail.deletions,
        changed_files: githubPRDetail.changed_files,
        review_quality: prQuality(githubPRDetail.commits, githubPRDetail.changed_files, githubPRDetail.body),
      };
      logger.info('Saving PR info...');
      await store.upsertPRInfo(prData);
    };

    const saveReviewerDetails = async (owner, repository, prInfo) => {
      logger.info(`Retrieving PR reviewers (${prInfo.number}) details...`);
      const { data: githubPRReviewers } = await github.getReviewers({
        urlParams: {
          owner,
          repository,
          prNumber: prInfo.number,
        },
      });
      const changeRequested = filterByState(githubPRReviewers, 'CHANGES_REQUESTED');
      const approveChanges = filterByState(githubPRReviewers, 'APPROVED');
      const reviewers = approveChanges.map(review => {
        const approvedAfterRequestChanges = changeRequested.find(({ user }) => user.id === review.user.id);
        return {
          ...review.user,
          status: 'REVIEWED',
          reviewQuality: approvedAfterRequestChanges ? 'GREAT_REVIEW' : 'OK',
        };
      });
      return saveReviewers(prInfo.id, reviewers);
    };

    const processPR = (owner, repository) => async prInfo => {
      // GET PR Detail & save PR info
      await upsertPRInfo(owner, repository, prInfo);
      // Save reviewers do not review
      await saveReviewers(prInfo.id, prInfo.requested_reviewers);
      // Get reviews endpoint and save that info
      await saveReviewerDetails(owner, repository, prInfo);
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
      const processPRs = prs.map(processPR(owner, repository));
      return Promise.all(processPRs);
    };
    return { digestRepo };
  };
  return { start };
};
