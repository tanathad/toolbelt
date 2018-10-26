const {Command, flags} = require('@oclif/command')
const chalk = require('chalk');
const authenticator = require('../services/authenticator');
const Prompter = require('../services/prompter');
const logger = require('../services/logger');

class LoginCommand extends Command {
  async run() {
    await authenticator
      .logout({ log: false });

    const config = await Prompter([
      'email',
      'password',
    ]);

    try {
      await authenticator.login(config);
      console.log(chalk.green(`👍  You're now logged as ${config.email} 👍 `));
    } catch (err) {
      if (err.status) {
        logger.error('🔥  The email or password you entered is incorrect 🔥');
      } else {
        logger.error('💀  Oops, something went wrong.💀');
      }
    }
  }
}

LoginCommand.description = `Sign in with an existing account.`

module.exports = LoginCommand
