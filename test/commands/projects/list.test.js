const Nock = require('@fancy-test/nock').default;
const Test = require('@oclif/test');
const test = Test.test.register('nock', Nock)
const expect = Test.expect
const ProjectSerializer = require('../../../src/serializers/project');

describe('projects:list', () => {
  const mocks = test
    .stdout()
    .env({ SERVER_HOST: 'http://localhost:3001' })
    .nock('http://localhost:3001', api => api
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
          renderings: [{ isDefault: true, id: '4911' }]
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
          renderings: [ { isDefault: true, id: '68' } ] },
      }]))
    );

    mocks
      .command(['projects:list'])
      .it('should return the list of projects', ctx => {
        expect(ctx.stdout).to.contain('PROJECTS');

        expect(ctx.stdout).to.contain('ID');
        expect(ctx.stdout).to.contain('21');
        expect(ctx.stdout).to.contain('NAME');
        expect(ctx.stdout).to.contain('Illustrio');

        expect(ctx.stdout).to.contain('ID');
        expect(ctx.stdout).to.contain('82');
        expect(ctx.stdout).to.contain('NAME');
        expect(ctx.stdout).to.contain('Forest');
      });

    mocks
      .command(['projects:list', '--format', 'json'])
      .it('should return the list of projects', ctx => {
        expect(JSON.parse(ctx.stdout)).to.eql([{
          id: '82',
          name: 'Forest',
          defaultEnvironment: {
            id: '2200',
            name: 'Production',
            apiEndpoint: 'https://api.forestadmin.com',
            type: 'production',
          }
        }, {
          id: '21',
          name: 'Illustrio',
          defaultEnvironment: {
            id: '39',
            name: 'Production',
            apiEndpoint: 'http://dev.illustrio.com:5001',
            type: 'development',
          }
        }]);
      });
});
