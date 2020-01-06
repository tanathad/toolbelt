const Nock = require('@fancy-test/nock').default;
const { test } = require('@oclif/test');

const fancy = test.register('nock', Nock);
const EnvironmentSerializer = require('../../../src/serializers/environment');
const authenticator = require('../../../src/services/authenticator');

describe('environments', () => {
  let getAuthToken;
  let logs;

  console.log = (log) => { logs += log; };

  beforeEach(() => {
    logs = '';
    getAuthToken = authenticator.getAuthToken;
    authenticator.getAuthToken = () => 'token';
  });

  function cleanTest() {
    authenticator.getAuthToken = getAuthToken;
  }

  const mocks = fancy
    .stdout()
    .env({ FOREST_URL: 'http://localhost:3001' })
    .nock('http://localhost:3001', (api) => api
      .get('/api/projects/82/environments')
      .reply(200, EnvironmentSerializer.serialize([{
        id: '324',
        name: 'Staging',
        apiEndpoint: 'https://forestadmin-server-staging.herokuapp.com',
        isActive: true,
        type: 'development',
        lianaName: 'forest-express-sequelize',
        lianaVersion: '1.3.2',
        secretKey: '2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125',
      }, {
        id: '325',
        name: 'Production',
        apiEndpoint: 'https://forestadmin-server.herokuapp.com',
        isActive: true,
        type: 'production',
        lianaName: 'forest-express-sequelize',
        lianaVersion: '1.3.2',
        secretKey: '1b91a1c9bb28e4bea3c941fac1c1c95db5dc1b7bc73bd649b0b113713ee18167',
      }])));

  describe('without JSON format option', () => {
    mocks
      .command(['environments', '-p', '82'])
      .it('should return the list of environments', () => {
        expect(logs).toContain('ENVIRONMENTS');

        expect(logs).toContain('ID');
        expect(logs).toContain('324');
        expect(logs).toContain('NAME');
        expect(logs).toContain('Staging');
        expect(logs).toContain('URL');
        expect(logs).toContain('https://');
        expect(logs).toContain('TYPE');
        expect(logs).toContain('development');

        expect(logs).toContain('ID');
        expect(logs).toContain('325');
        expect(logs).toContain('NAME');
        expect(logs).toContain('Production');
        expect(logs).toContain('URL');
        expect(logs).toContain('https://');
        expect(logs).toContain('TYPE');
        expect(logs).toContain('production');
      });
    cleanTest();
  });

  describe('with JSON format option', () => {
    mocks
      .command(['environments', '-p', '82', '--format', 'json'])
      .it('should return the list of environments in JSON', () => {
        expect(JSON.parse(logs)).toStrictEqual([
          {
            id: '324',
            name: 'Staging',
            apiEndpoint: 'https://forestadmin-server-staging.herokuapp.com',
            isActive: true,
            type: 'development',
            lianaName: 'forest-express-sequelize',
            lianaVersion: '1.3.2',
            secretKey: '2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125',
          },
          {
            id: '325',
            name: 'Production',
            apiEndpoint: 'https://forestadmin-server.herokuapp.com',
            isActive: true,
            type: 'production',
            lianaName: 'forest-express-sequelize',
            lianaVersion: '1.3.2',
            secretKey: '1b91a1c9bb28e4bea3c941fac1c1c95db5dc1b7bc73bd649b0b113713ee18167',
          },
        ]);
      });
    cleanTest();
  });
});
