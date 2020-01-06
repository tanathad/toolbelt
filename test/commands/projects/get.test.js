const Nock = require('@fancy-test/nock').default;
const { test } = require('@oclif/test');

const fancy = test.register('nock', Nock);
const ProjectSerializer = require('../../../src/serializers/project');
const authenticator = require('../../../src/services/authenticator');

describe('projects:get', () => {
  let getAuthToken;
  let logs;

  console.log = (log) => { logs += log; };

  beforeEach(() => {
    logs = '';
    getAuthToken = authenticator.getAuthToken;
    authenticator.getAuthToken = () => 'token';
  });
  afterEach(() => { authenticator.getAuthToken = getAuthToken; });

  const mocks = fancy
    .stdout()
    .env({ FOREST_URL: 'http://localhost:3001' })
    .nock('http://localhost:3001', (api) => api
      .get('/api/projects/82')
      .reply(200, ProjectSerializer.serialize({
        id: '82',
        name: 'Forest',
        defaultEnvironment: {
          name: 'Production',
          apiEndpoint: 'https://api.forestadmin.com',
          type: 'production',
          id: '2200',
        },
      })));

  describe('on an existing project', () => {
    describe('without json option', () => {
      mocks
        .command(['projects:get', '82'])
        .it('should display the configuration of the Forest project', () => {
          expect(logs).toContain('PROJECT');
          expect(logs).toContain('id');
          expect(logs).toContain('82');
          expect(logs).toContain('name');
          expect(logs).toContain('Forest');
          expect(logs).toContain('default environment');
          expect(logs).toContain('production');
        });
    });

    describe('with a json option', () => {
      mocks
        .command(['projects:get', '82', '--format', 'json'])
        .it('should display the configuration of the Forest project in JSON', () => {
          expect(JSON.parse(logs)).toStrictEqual({
            id: '82',
            name: 'Forest',
            defaultEnvironment: {
              name: 'Production',
              apiEndpoint: 'https://api.forestadmin.com',
              type: 'production',
              id: '2200',
            },
          });
        });
    });
  });
});
