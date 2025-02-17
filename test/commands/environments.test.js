const testDialog = require('./test-cli');
const EnvironmentCommand = require('../../src/commands/environments');
const {
  loginRequired,
  loginPasswordDialog,
  enter,
  arrowDown,
} = require('../fixtures/dialogs');
const { testEnv } = require('../fixtures/envs');
const {
  notAGoogleAccountNock,
  validAuthNock,
  projectListNock,
  environmentListNock,
} = require('../fixtures/nocks');

describe('environments', () => {
  it('should display environment list', () => testDialog({
    env: testEnv,
    command: () => EnvironmentCommand.run([]),
    nock: [
      notAGoogleAccountNock(),
      validAuthNock(),
      projectListNock(),
      environmentListNock(),
    ],
    dialog: [
      ...loginRequired,
      ...loginPasswordDialog,
      ...arrowDown,
      ...enter,
      { out: 'ENVIRONMENTS' },
      { out: 'ID        NAME                URL                                TYPE' },
      { out: '3         name1               http://localhost:1                 type1' },
      { out: '4         name2               http://localhost:2                 type2' },
    ],
  }));
});
