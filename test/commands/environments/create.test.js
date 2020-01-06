const Nock = require('@fancy-test/nock').default;
const { test } = require('@oclif/test');

const fancy = test.register('nock', Nock);
const EnvironmentSerializer = require('../../../src/serializers/environment');
const authenticator = require('../../../src/services/authenticator');

describe('environments:create', () => {
  let getAuthToken;
  let logs;

  console.log = (log) => { logs += log; };

  beforeEach(() => {
    logs = '';
    getAuthToken = authenticator.getAuthToken;
    authenticator.getAuthToken = () => 'token';
  });
  afterEach(() => {
    authenticator.getAuthToken = getAuthToken;
  });

  const mocks = fancy
    .stdout()
    .env({ FOREST_URL: 'http://localhost:3001' })
    .nock('http://localhost:3001', (api) => api
      .post('/api/environments')
      .reply(200, EnvironmentSerializer.serialize({
        name: 'Test',
        apiEndpoint: 'https://test.forestadmin.com',
        secretKey: '2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125',
      })));

  describe('without JSON format option', () => {
    mocks
      .command(['environments:create', '-p', '82', '-n', 'Test', '-u', 'https://test.forestadmin.com'])
      .it('should returns the freshly created environment', () => {
        expect(logs).toContain('ENVIRONMENT');
        expect(logs).toContain('id');
        expect(logs).toContain('name');
        expect(logs).toContain('Test');
        expect(logs).toContain('url');
        expect(logs).toContain('https://test.forestadmin.com');
        expect(logs).toContain('type');
        expect(logs).toContain('active');
        expect(logs).toContain('liana');
        expect(logs).toContain('version');
        expect(logs).toContain('FOREST_ENV_SECRET');
        expect(logs).toContain('2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125');
      });
  });

  describe('with JSON format option', () => {
    mocks
      .command(['environments:create', '-p', '82', '-n', 'Test', '-u', 'https://test.forestadmin.com',
        '--format', 'json'])
      .it('should returns the freshly created environment in JSON', () => {
        expect(JSON.parse(logs)).toStrictEqual({
          name: 'Test',
          apiEndpoint: 'https://test.forestadmin.com',
          secretKey: '2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125',
        });
      });
  });
});
