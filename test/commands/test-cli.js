const _ = require('lodash');
const mockStdin = require('mock-stdin');
const { stdout, stderr } = require('stdout-stderr');
const authenticator = require('./../../src/services/authenticator');

const errorIfRest = (rest) => {
  if (Object.keys(rest).length > 0) {
    throw new Error(`Unknown testCli parameter(s): ${Object.keys(rest).join(', ')}`);
  }
};

const errorIfStdRest = (stds) => {
  const valids = ['in', 'out', 'err'];
  const rest = stds.filter((type) =>
    !valids.find((valid) =>
      Object.prototype.hasOwnProperty.call(type, valid)));
  if (rest.length > 0) {
    throw new Error(`testCli configuration error: Invalid "std" attribute(s). 
      Valids are: ${valids.join(', ')}`);
  }
};

const errorIfBadCommand = (command) => {
  if (!command || !_.isFunction(command)) {
    throw new Error('testCli configuration error: "command" must be a function ex.'
      + ' () => GetCommand.run([\'324\'])');
  }
};

const errorIfNoStd = (stds) => {
  if (!stds || !Array.isArray(stds) || !stds.length > 0) {
    throw new Error('testCli configuration error: "std" must be an array ex.'
      + ' [{in:\'john\'},{out:\'hello, john\'}]');
  }
};

const asArray = (any) => {
  if (!any) return [];
  return Array.isArray(any) ? any : [any];
};

const prepare = (nock, stds) => ({
  nocks: asArray(nock),
  inputs: stds ? stds.filter((type) => type.in).map((type) => type.in) : [],
  outputs: stds ? stds.filter((type) => type.out).map((type) => type.out) : [],
  errorOutputs: stds ? stds.filter((type) => type.err).map((type) => type.err) : [],
});

const definePrint = (print) => {
  stdout.previousPrint = stdout.print;
  stderr.previousPrint = stderr.print;
  stdout.print = print;
  stderr.print = print;
};

const mockEnv = (env) => {
  if (env) {
    process.previousEnv = process.env;
    process.env = env;
  }
};

const mockToken = (behavior) => {
  if (behavior !== null) {
    authenticator.getAuthTokenBack = authenticator.getAuthToken;
    authenticator.getAuthToken = () => behavior;
  }
};

const mockStd = (outputs, errorOutputs) => {
  const stdin = mockStdin.stdin();
  if (outputs.length) stdout.start();
  if (errorOutputs.length) stderr.start();
  return stdin;
};

const planifyInputs = (inputs, stdin) => {
  for (let i = 0; i < inputs.length; i += 1) {
    setTimeout(() => stdin.send(`${inputs[i]}\n`), 500 + i * 100);
  }
};

const rollbackStd = (stdin, inputs, outputs, errorOutputs) => {
  if (inputs.length) stdin.end();
  if (inputs.length) stdin.reset();
  if (outputs.length) stdout.stop();
  if (errorOutputs.length) stderr.stop();
};

const assertOutputs = (outputs, errorOutputs) => {
  for (let i = 0; i < outputs.length; i += 1) {
    const isString = typeof outputs[i] === 'string' || outputs[i] instanceof String;
    if (isString) {
      expect(stdout.output).toContain(outputs[i]);
    } else {
      const isJson = outputs[i].constructor === ({}).constructor;
      if (isJson) {
        expect(JSON.parse(stdout.output)).toStrictEqual(outputs[i]);
      }
    }
  }
  for (let i = 0; i < errorOutputs.length; i += 1) {
    expect(stderr.output).toContain(errorOutputs[i]);
  }
};

const assertNocks = (nocks) => {
  nocks.forEach((nock) => nock.done());
};

const rollbackEnv = (env) => {
  if (env) {
    process.env = process.previousEnv;
    process.previousEnv = null;
  }
};

const rollbackToken = (behavior) => {
  if (behavior !== null) {
    authenticator.getAuthToken = authenticator.getAuthTokenBack;
    authenticator.getAuthTokenBack = null;
  }
};

const rollbackPrint = () => {
  stdout.print = stdout.previousPrint;
  stderr.print = stderr.previousPrint;
  stdout.previousPrint = null;
  stderr.previousPrint = null;
};

module.exports = ({
  api, env, command, std: stds, print = false, token: tokenBehavior = null, ...rest
}) => {
  errorIfRest(rest);
  errorIfBadCommand(command);
  errorIfNoStd(stds);
  errorIfStdRest(stds);
  const {
    nocks, inputs, outputs, errorOutputs,
  } = prepare(api, stds);

  return async () => {
    definePrint(print);
    mockEnv(env);
    mockToken(tokenBehavior);
    const stdin = mockStd(outputs, errorOutputs);

    planifyInputs(inputs, stdin);
    await command();

    assertNocks(nocks);
    rollbackStd(stdin, inputs, outputs, errorOutputs);
    assertOutputs(outputs, errorOutputs);
    rollbackEnv(env);
    rollbackToken(tokenBehavior);
    rollbackPrint();
  };
};
