const testCli = require('./test-cli');
const EnvironmentCommand = require('../../src/commands/environments');
const {
  enter,
  arrowDown,
} = require('../fixtures/std');
const { testEnv } = require('../fixtures/env');
const {
  notAGoogleAccount,
  aLogInValid,
  aProjectListValid,
  anEnvironmentListValid,
} = require('../fixtures/api');

describe('environments', () => {
  it('should display environment list', testCli({
    env: testEnv,
    command: () => EnvironmentCommand.run([]),
    api: [
      notAGoogleAccount(),
      aLogInValid(),
      aProjectListValid(),
      anEnvironmentListValid(),
    ],
    std: [
      { out: 'Login required.' },
      { out: 'What is your email address?' },
      { in: 'some@mail.com' },
      { out: 'What is your Forest Admin password: [input is hidden] ?' },
      { in: 'valid_pwd' },
      { out: 'Login successful' },
      ...arrowDown,
      ...enter,
      { out: 'ENVIRONMENTS' },
      { out: 'ID        NAME                URL                                TYPE' },
      { out: '3         name1               http://localhost:1                 type1' },
      { out: '4         name2               http://localhost:2                 type2' },
    ],
  }));
});
