const Nock = require('@fancy-test/nock').default;
const { expect, test } = require('@oclif/test');
const testDialog = require('./../test-cli');
const EnvironmentCreate = require('../../../src/commands/environments/create');
const {
  loginPasswordDialog,
  loginRequired,
} = require('../../fixtures/dialogs');
const {
  notAGoogleAccountNock,
  validAuthNock,
  projectListNock,
  createEnvironmentNock,
} = require('../../fixtures/nocks');
const { testEnv } = require('../../fixtures/envs');
const {
  enter,
  arrowDown,
} = require('../../fixtures/dialogs');

const fancy = test.register('nock', Nock);
const EnvironmentSerializer = require('../../../src/serializers/environment');
const authenticator = require('../../../src/services/authenticator');

describe('environments:create', () => {
  describe('with a logged-in user', () => {
    let getAuthToken;
    before(() => {
      getAuthToken = authenticator.getAuthToken;
      authenticator.getAuthToken = () => 'token';
    });
    after(() => {
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

    mocks
      .command(['environments:create', '-p', '82', '-n', 'Test', '-u', 'https://test.forestadmin.com'])
      .it('should returns the freshly created environment', (ctx) => {
        expect(ctx.stdout).to.contain('ENVIRONMENT');
        expect(ctx.stdout).to.contain('id');
        expect(ctx.stdout).to.contain('name');
        expect(ctx.stdout).to.contain('Test');
        expect(ctx.stdout).to.contain('url');
        expect(ctx.stdout).to.contain('https://test.forestadmin.com');
        expect(ctx.stdout).to.contain('type');
        expect(ctx.stdout).to.contain('active');
        expect(ctx.stdout).to.contain('liana');
        expect(ctx.stdout).to.contain('version');
        expect(ctx.stdout).to.contain('FOREST_ENV_SECRET');
        expect(ctx.stdout).to.contain('2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125');
      });

    mocks
      .command(['environments:create', '-p', '82', '-n', 'Test', '-u', 'https://test.forestadmin.com',
        '--format', 'json'])
      .it('should returns the freshly created environment in JSON', (ctx) => {
        expect(JSON.parse(ctx.stdout)).to.eql({
          name: 'Test',
          apiEndpoint: 'https://test.forestadmin.com',
          secretKey: '2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125',
        });
      });
  });

  describe('without a logged-in user', () => {
    it('should returns the freshly created environment', () => testDialog({
      env: testEnv,
      command: () => EnvironmentCreate.run(['-n', 'Test', '-u', 'https://test.forestadmin.com']),
      nock: [
        notAGoogleAccountNock(),
        validAuthNock(),
        projectListNock(),
        createEnvironmentNock(),
      ],
      dialog: [
        ...loginRequired,
        ...loginPasswordDialog,
        ...arrowDown,
        ...enter,
        { out: 'ENVIRONMENT' },
        { out: 'name               Test' },
        { out: 'url                https://test.forestadmin.com' },
        { out: 'FOREST_ENV_SECRET  2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125' },
      ],
    }));
  });
});
