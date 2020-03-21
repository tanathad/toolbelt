const _ = require('lodash');

module.exports = {
  errorIfRest: (rest) => {
    if (Object.keys(rest).length > 0) {
      throw new Error(`Unknown testCli parameter(s): ${Object.keys(rest).join(', ')}`);
    }
  },
  errorIfStdRest: (stds) => {
    const valids = ['in', 'out', 'err'];
    const rest = stds.filter((type) =>
      !valids.find((valid) =>
        Object.prototype.hasOwnProperty.call(type, valid)));
    if (rest.length > 0) {
      throw new Error(`testCli configuration error: Invalid "std" attribute(s). 
      Valids are: ${valids.join(', ')}`);
    }
  },
  errorIfBadCommand: (command) => {
    if (!command || !_.isFunction(command)) {
      throw new Error('testCli configuration error: "command" must be a function ex.'
        + ' () => GetCommand.run([\'324\'])');
    }
  },
  errorIfNoStd: (stds) => {
    if (!stds || !Array.isArray(stds) || !stds.length > 0) {
      throw new Error('testCli configuration error: "std" must be an array ex.'
        + ' [{in:\'john\'},{out:\'hello, john\'}]');
    }
  },
};
