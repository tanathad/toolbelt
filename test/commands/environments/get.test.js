const testCli = require('./../test-cli');
const {
  anEnvironmentValid,
  anEnvironmentNotFound,
} = require('../../fixtures/nocks');
const { testEnv } = require('../../fixtures/envs');
const GetCommand = require('../../../src/commands/environments/get');

describe('environments:get', () => {
  describe('on an existing environment', () => {
    describe('without JSON format option', () => {
      it('should display the configuration of the Staging environment', testCli({
        env: testEnv,
        token: 'any',
        command: () => GetCommand.run(['324']),
        api: [
          anEnvironmentValid(),
        ],
        std: [
          { out: 'id                 324' },
          { out: 'name               Staging' },
          { out: 'url                https://forestadmin-server-staging.herokuapp.com' },
          { out: 'active             true' },
          { out: 'type               development' },
          { out: 'liana              forest-express-sequelize' },
          { out: 'version            1.3.2' },
          { out: 'FOREST_ENV_SECRET  2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125' },
        ],
      }));
    });
    describe('with JSON format option', () => {
      it('should display the configuration of the Staging environment', testCli({
        env: testEnv,
        token: 'any',
        command: () => GetCommand.run(['324', '--format', 'json']),
        api: [
          anEnvironmentValid(),
        ],
        std: [
          {
            out: {
              name: 'Staging',
              apiEndpoint: 'https://forestadmin-server-staging.herokuapp.com',
              isActive: true,
              type: 'development',
              lianaName: 'forest-express-sequelize',
              lianaVersion: '1.3.2',
              secretKey: '2c38a1c6bb28e7bea1c943fac1c1c95db5dc1b7bc73bd649a0b113713ee29125',
              id: '324',
            },
          },
        ],
      }));
    });
  });

  describe('on an unknown environment', () => {
    it('should display a NotFound error', testCli({
      env: testEnv,
      token: 'any',
      command: () => GetCommand.run(['3947']),
      api: [
        anEnvironmentNotFound(),
      ],
      std: [
        { err: 'Cannot find the environment 3947.\n' },
      ],
    }));
  });
});
