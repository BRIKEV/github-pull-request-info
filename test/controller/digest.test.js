const nock = require('nock');
const expect = require('expect.js');
const system = require('../../system');
const pullRequests = require('../fixtures/github/pull_requests.json');
const orgRepo = require('../fixtures/expectations/org-repo.json');

describe('Digest method Tests', () => {
  let controllerAPI;
  let pgAPI;
  const sys = system();

  before(async () => {
    const { controller, pg } = await sys.start();
    controllerAPI = controller;
    pgAPI = pg;
  });

  beforeEach(async () => {
    await pgAPI.query('truncate-all');
  });

  after(() => sys.stop());

  it.only('should save the right amount of users', async () => {
    const testRepo = 'test-repo';
    const testOrg = 'test-org';
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls?state=closed&direction=desc`)
      .reply(200, pullRequests);
    await controllerAPI.digest.digestRepo(testOrg, testRepo);
    const { rows: projects } = await pgAPI.query('select-org-repo');
    expect(projects).to.eql(orgRepo);
  });
});
