const nock = require('nock');
const expect = require('expect.js');
const system = require('../../system');
const pullRequests = require('../fixtures/github/pull_requests.json');
const firstPullRequest = require('../fixtures/github/firstPullRequest.json');
const secondPullRequest = require('../fixtures/github/secondPullRequest.json');
const thirdPullRequest = require('../fixtures/github/thirdPullRequest.json');
const firstReviewersResponse = require('../fixtures/github/firstReviewersResponse.json');
const secondReviewersResponse = require('../fixtures/github/secondReviewersResponse.json');
const thirdReviewersResponse = require('../fixtures/github/thirdReviewersResponse.json');
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

  it('should save the right amount of users', async () => {
    const testRepo = 'test-repo';
    const testOrg = 'test-org';
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls?state=closed&direction=desc`)
      .reply(200, pullRequests);
    /** -- PR details mock -- */
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/1`)
      .reply(200, firstPullRequest);
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/2`)
      .reply(200, secondPullRequest);
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/3`)
      .reply(200, thirdPullRequest);
    /** -- PR reviews details mock -- */
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/1/reviews`)
      .reply(200, firstReviewersResponse);
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/2/reviews`)
      .reply(200, secondReviewersResponse);
    nock('https://api.github.com')
      .get(`/repos/${testOrg}/${testRepo}/pulls/3/reviews`)
      .reply(200, thirdReviewersResponse);
    await controllerAPI.digest.digestRepo(testOrg, testRepo);
    const { rows: projects } = await pgAPI.query('select-org-repo');
    expect(projects).to.eql(orgRepo);
    const { rows: users } = await pgAPI.query('SELECT * FROM info.user');
    const { rows: noReviewedPR } = await pgAPI.query('SELECT * FROM info.reviewer WHERE status = \'NO_REVIEWED\'');
    const { rows: reviewedPR } = await pgAPI.query('SELECT * FROM info.reviewer WHERE status = \'REVIEWED\'');
    const { rows: greatReviewedPR } = await pgAPI.query('SELECT * FROM info.reviewer WHERE review_quality = \'GREAT_REVIEW\'');
    const { rows: dbPullRequests } = await pgAPI.query('SELECT * FROM info.pull_request');
    expect(users).to.have.length(7);
    expect(dbPullRequests).to.have.length(3);
    expect(noReviewedPR).to.have.length(8);
    expect(reviewedPR).to.have.length(5);
    expect(greatReviewedPR).to.have.length(1);
  });
});
