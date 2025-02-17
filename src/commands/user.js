const { Command } = require('@oclif/command');
const jwt = require('jsonwebtoken');
const chalk = require('chalk');
const logger = require('../services/logger');
const authenticator = require('../services/authenticator');

class UserCommand extends Command {
  static async run() {
    const token = authenticator.getAuthToken();
    if (token) {
      const decoded = jwt.decode(token);
      console.log(chalk.bold('Email: ') + chalk.cyan(decoded.data.data.attributes.email));
    } else {
      logger.error('You are not logged.');
    }
  }
}

UserCommand.description = 'display the current logged in user';

module.exports = UserCommand;
