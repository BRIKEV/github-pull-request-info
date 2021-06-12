module.exports = () => {
  const start = async ({ pg }) => {
    const saveNonReviewers = async reviewPayload => {
      const upsertOptions = {
        conflictTarget: 'reviewer_pull_request_uk',
        isTargetConstraint: true,
      };
      const { rows: [insertedProgress] } = await pg
        .upsert(`${pg.schema}.reviewer`, reviewPayload, upsertOptions);
      return insertedProgress;
    };

    const upsertUser = async user => {
      const { rows: [insertedProgress] } = await pg
        .upsert(`${pg.schema}.user`, user);
      return insertedProgress;
    };

    const saveProjectInfo = async (repoDetails, ownerDetails) => (
      pg.withTransaction(async transaction => {
        const schemaTransaction = transaction.schema('info');
        await pg.upsert('info.org_owner', ownerDetails, {}, schemaTransaction);
        await pg.upsert('info.repository', repoDetails, {}, schemaTransaction);
      })
    );

    return { saveNonReviewers, upsertUser, saveProjectInfo };
  };

  return { start };
};
