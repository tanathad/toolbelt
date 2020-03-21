const nock = require('nock');
const jwt = require('jsonwebtoken');
const ProjectSerializer = require('../../src/serializers/project');
const EnvironmentSerializer = require('../../src/serializers/environment');
const JobSerializer = require('../../src/serializers/job');

module.exports = {
  aGoogleAccount: () => nock('http://localhost:3001')
    .get('/api/users/google/robert@gmail.com')
    .reply(200, { data: { isGoogleAccount: true } }),

  notAGoogleAccount: () => nock('http://localhost:3001')
    .get('/api/users/google/some@mail.com')
    .reply(200, { data: { isGoogleAccount: false } }),

  loginValid: () => nock('http://localhost:3001')
    .post('/api/sessions', { email: 'some@mail.com', password: 'valid_pwd' })
    .reply(200, { token: jwt.sign({}, 'key', { expiresIn: '1day' }) }),

  loginInvalid: () => nock('http://localhost:3001')
    .post('/api/sessions', { email: 'some@mail.com', password: 'pwd' })
    .reply(401),

  getProjectListValid: () => nock('http://localhost:3001')
    .get('/api/projects')
    .reply(200, ProjectSerializer.serialize([
      { id: 1, name: 'project1' },
      { id: 2, name: 'project2' },
    ])),

  getEnvironmentListValid: () => nock('http://localhost:3001')
    .get('/api/projects/2/environments')
    .reply(200, EnvironmentSerializer.serialize([
      {
        id: 3, name: 'name1', apiEndpoint: 'http://localhost:1', type: 'type1',
      },
      {
        id: 4, name: 'name2', apiEndpoint: 'http://localhost:2', type: 'type2',
      },
    ])),

  getEnvironmentValid: () => nock('http://localhost:3001')
    .matchHeader('forest-environment-id', '324')
    .get('/api/environments/324')
    .reply(200, EnvironmentSerializer.serialize({
      id: '324',
      name: 'Staging',
      apiEndpoint: 'https://forestadmin-server-staging.herokuapp.com',
      isActive: true,
      type: 'development',
      lianaName: 'forest-express-sequelize',
      lianaVersion: '1.3.2',
      secretKey: '2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125',
    })),

  getEnvironmentNotFound: () => nock('http://localhost:3001')
    .matchHeader('forest-environment-id', '3947')
    .get('/api/environments/3947')
    .reply(404),

  updateEnvironmentName: () => nock('http://localhost:3001')
    .put('/api/environments/182', {
      data: {
        type: 'environments',
        attributes: { name: 'NewName' },
      },
    })
    .reply(200),

  updateEnvironmentEndpoint: () => nock('http://localhost:3001')
    .put('/api/environments/182', {
      data: {
        type: 'environments',
        attributes: { 'api-endpoint': 'https://super.url.com' },
      },
    })
    .reply(200),

  deleteEnvironment: () => nock('http://localhost:3001')
    .matchHeader('forest-environment-id', '324')
    .delete('/api/environments/324')
    .reply(200, {
      meta: {
        job_id: 78,
      },
    }),

  getJob: () => nock('http://localhost:3001')
    .get('/api/jobs/78')
    .reply(200, JobSerializer.serialize({
      state: 'complete',
      progress: '100',
    })),

  getJobFailed: () => nock('http://localhost:3001')
    .get('/api/jobs/78')
    .reply(200, JobSerializer.serialize({
      state: 'failed',
      progress: '10',
    })),
};
