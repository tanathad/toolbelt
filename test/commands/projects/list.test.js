const Nock = require('@fancy-test/nock').default;
const { test } = require('@oclif/test');

const fancy = test.register('nock', Nock);
const ProjectSerializer = require('../../../src/serializers/project');
const authenticator = require('../../../src/services/authenticator');

describe('projects', () => {
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
      .get('/api/projects')
      .reply(200, ProjectSerializer.serialize([{
        id: '82',
        name: 'Forest',
        defaultEnvironment: {
          id: '2200',
          name: 'Production',
          apiEndpoint: 'https://api.forestadmin.com',
          type: 'production',
          lianaName: 'forest-express-sequelize',
          lianaVersion: '2.13.1',
          renderings: [{ isDefault: true, id: '4911' }],
        },
      }, {
        id: '21',
        name: 'Illustrio',
        defaultEnvironment: {
          id: '39',
          name: 'Production',
          apiEndpoint: 'http://dev.illustrio.com:5001',
          type: 'development',
          lianaName: 'forest-express-mongoose',
          lianaVersion: '0.2.17',
          renderings: [{ isDefault: true, id: '68' }],
        },
      }])));

  describe('without json option', () => {
    mocks
      .command(['projects'])
      .it('should return the list of projects', () => {
        expect(logs).toContain('PROJECTS');

        expect(logs).toContain('ID');
        expect(logs).toContain('21');
        expect(logs).toContain('NAME');
        expect(logs).toContain('Illustrio');

        expect(logs).toContain('ID');
        expect(logs).toContain('82');
        expect(logs).toContain('NAME');
        expect(logs).toContain('Forest');
      });
    cleanTest();
  });


  describe('with json option', () => {
    mocks
      .command(['projects', '--format', 'json'])
      .it('should return the list of projects', () => {
        expect(JSON.parse(logs)).toStrictEqual([{
          id: '82',
          name: 'Forest',
          defaultEnvironment: {
            id: '2200',
            name: 'Production',
            apiEndpoint: 'https://api.forestadmin.com',
            type: 'production',
          },
        }, {
          id: '21',
          name: 'Illustrio',
          defaultEnvironment: {
            id: '39',
            name: 'Production',
            apiEndpoint: 'http://dev.illustrio.com:5001',
            type: 'development',
          },
        }]);
      });
    cleanTest();
  });
});
