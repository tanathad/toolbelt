const mockStdin = require('mock-stdin');
const { stdout, stderr } = require('stdout-stderr');
const logger = require('./../../src/services/logger');

const asArray = (any) => {
  if (!any) return [];
  return Array.isArray(any) ? any : [any];
};

const errorIfRestNotEmpty = (rest) => {
  if (Object.keys(rest).length > 0) {
    throw new Error(`Unknown testCli parameter(s): ${Object.keys(rest).join(', ')}`);
  }
};

const errorIfDialogRestNotEmpty = (dialog) => {
  const valids = ['in', 'out', 'err'];
  const rest = dialog.filter((type) => !valids.find(valid => type.hasOwnProperty(valid)));
  if (rest.length > 0) {
    throw new Error(`Unknown testCli dialog attribute(s). Valids are: ${valids.join(', ')}`);
  }
};

module.exports = async function testCli({
                                          nock, env, command, dialog, print = false, ...rest
                                        }) {
  errorIfRestNotEmpty(rest);
  errorIfDialogRestNotEmpty(dialog);
  stdout.print = print;
  stderr.print = print;
  const nocks = asArray(nock);
  const inputs = dialog ? dialog.filter((type) => type.in).map((type) => type.in) : [];
  const outputs = dialog ? dialog.filter((type) => type.out).map((type) => type.out) : [];
  const errorOutputs = dialog ? dialog.filter((type) => type.err).map((type) => type.err) : [];
  const previousEnv = process.env;
  if (env) process.env = env;

  const stdin = mockStdin.stdin();

  for (let i = 0; i < inputs.length; i += 1) {
    setTimeout(() => stdin.send(`${inputs[i]}\n`), 500 + i * 100);
  }

  if (outputs.length) stdout.start();
  if (errorOutputs.length) stderr.start();
  await command();
  nocks.forEach((item) => item.done());
  if (inputs.length) stdin.end();
  if (inputs.length) stdin.reset();
  if (outputs.length) stdout.stop();
  if (errorOutputs.length) stderr.stop();

  for (let i = 0; i < outputs.length; i += 1) {
    const isString = typeof outputs[i] === 'string' || outputs[i] instanceof String;
    if (isString) {
      expect(stdout.output).toContain(outputs[i]);
    } else {
      const isJson = outputs[i].constructor === ({}).constructor;
      if (isJson) {
        expect(JSON.parse(stdout.output)).toEqual(outputs[i]);
      }
    }
  }

  for (let i = 0; i < errorOutputs.length; i += 1) {
    expect(stderr.output).toContain(errorOutputs[i]);
  }

  process.env = previousEnv;
};
