const nock = require('nock');
const expect = require('expect.js');
const system = require('../../system');
const pullRequests = require('../fixtures/github/pull_requests.json');
const firstPullRequest = require('../fixtures/github/firstPullRequest.json');
const secondPullRequest = require('../fixtures/github/secondPullRequest.json');
const thirdPullRequest = require('../fixtures/github/thirdPullRequest.json');
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
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/1`)
      .reply(200, firstPullRequest);
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/2`)
      .reply(200, secondPullRequest);
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/3`)
      .reply(200, thirdPullRequest);
    await controllerAPI.digest.digestRepo(testOrg, testRepo);
    const { rows: projects } = await pgAPI.query('select-org-repo');
    expect(projects).to.eql(orgRepo);
    const { rows: users } = await pgAPI.query('SELECT * FROM info.user');
    const { rows: noReviewedPR } = await pgAPI.query('SELECT * FROM info.reviewer WHERE status = \'NO_REVIEWED\'');
    const { rows: dbPullRequests } = await pgAPI.query('SELECT * FROM info.pull_request');
    expect(users).to.have.length(7);
    expect(dbPullRequests).to.have.length(3);
    expect(noReviewedPR).to.have.length(8);
  });
});
