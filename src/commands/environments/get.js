const { flags } = require('@oclif/command');
const chalk = require('chalk');
const EnvironmentManager = require('../../services/environment-manager');
const Renderer = require('../../renderers/environment');
const logger = require('../../services/logger');
const AbstractAuthenticatedCommand = require('../../abstract-authenticated-command');
const envConfig = require('../../config');

class GetCommand extends AbstractAuthenticatedCommand {
  async runIfAuthenticated() {
    const parsed = this.parse(GetCommand);
    const config = { ...envConfig, ...parsed.flags, ...parsed.args };
    const manager = new EnvironmentManager(config);

    try {
      const environment = await manager.getEnvironment(config.environmentId);
      new Renderer(config).render(environment);
    } catch (err) {
      logger.error(`Cannot find the environment ${chalk.bold(config.environmentId)}.`);
    }
  }
}

GetCommand.description = 'get the configuration of an environment';

GetCommand.flags = {
  format: flags.string({
    char: 'format',
    description: 'Ouput format',
    options: ['table', 'json'],
    default: 'table',
  }),
};

GetCommand.args = [{
  name: 'environmentId', required: true, description: 'ID of an environment',
}];

module.exports = GetCommand;
