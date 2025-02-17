const { flags } = require('@oclif/command');
const chalk = require('chalk');
const inquirer = require('inquirer');
const EnvironmentManager = require('../../services/environment-manager');
const AbstractAuthenticatedCommand = require('../../abstract-authenticated-command');
const withCurrentProject = require('../../services/with-current-project');
const envConfig = require('../../config');

class CopyLayoutCommand extends AbstractAuthenticatedCommand {
  async runIfAuthenticated() {
    const logError = this.error.bind(this);
    const parsed = this.parse(CopyLayoutCommand);
    const config = await withCurrentProject({ ...envConfig, ...parsed.flags, ...parsed.args });
    const manager = new EnvironmentManager(config);

    let fromEnvironment;
    let toEnvironment;
    let answers;

    try {
      fromEnvironment = await manager.getEnvironment(config.fromEnvironment);
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      this.error(`Cannot find the source environment ${chalk.bold(config.fromEnvironment)} on the project ${chalk.bold(config.projectId)}.`, { exit: 3 });
    }

    try {
      toEnvironment = await manager.getEnvironment(config.toEnvironment);
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      this.error(`Cannot find the target environment ${chalk.bold(config.toEnvironment)} on the project ${chalk.bold(config.projectId)}.`, { exit: 3 });
    }

    if (!config.force) {
      answers = await inquirer
        .prompt([{
          type: 'input',
          prefix: '⚠️  WARNING \t',
          name: 'confirm',
          message: `This will copy the environment's layout from ${chalk.red(fromEnvironment.name)} to ${chalk.red(toEnvironment.name)} and override the whole previous configuration.\nTo proceed, type ${chalk.red(toEnvironment.name)} or re-run this command with --force : `,
        }]);
    }

    try {
      if (!answers || answers.confirm === toEnvironment.name) {
        const copyLayout = await manager.copyLayout(fromEnvironment.id, toEnvironment.id, logError);
        if (copyLayout) {
          return this.log(`Environment's layout ${chalk.red(fromEnvironment.name)} successfully copied to ${chalk.red(toEnvironment.name)}.`);
        }
        return this.error('Oops, something went wrong.', { exit: 1 });
      }
      return this.error(`Confirmation did not match ${chalk.red(toEnvironment.name)}. Aborted.`, { exit: 2 });
    } catch (error) {
      if (error.status === 403) {
        return this.error(`You do not have the rights to copy the layout of the environment ${chalk.bold(fromEnvironment.name)} to ${chalk.bold(toEnvironment.name)}.`, { exit: 1 });
      }
      return this.error(error, { exit: 1 });
    }
  }
}

CopyLayoutCommand.description = 'copy the layout from one environment to another';

CopyLayoutCommand.flags = {
  projectId: flags.string({
    char: 'p',
    description: 'Forest project ID',
    default: null,
  }),
  force: flags.boolean({
    char: 'force',
    description: 'Force copy',
  }),
};

CopyLayoutCommand.args = [
  { name: 'fromEnvironment', required: true, description: 'Source environment ID' },
  { name: 'toEnvironment', required: true, description: 'Target environment ID' },
];

module.exports = CopyLayoutCommand;
