const { mockEnv, rollbackEnv } = require('./test-cli-env');
const { assertApi } = require('./test-cli-api');
const {
  mockToken,
  rollbackToken,
} = require('./test-cli-auth-token');
const {
  errorIfRest,
  errorIfStdRest,
  errorIfNoStd,
  errorIfBadCommand,
} = require('./test-cli-errors');
const {
  definePrint,
  mockStd,
  planifyInputs,
  assertOutputs,
  rollbackStd,
  rollbackPrint,
} = require('./test-cli-std');

const asArray = (any) => {
  if (!any) return [];
  return Array.isArray(any) ? any : [any];
};

const prepare = (api, stds, command, rest) => {
  errorIfRest(rest);
  errorIfBadCommand(command);
  errorIfNoStd(stds);
  errorIfStdRest(stds);
  return {
    nocks: asArray(api),
    inputs: stds ? stds.filter((type) => type.in).map((type) => type.in) : [],
    outputs: stds ? stds.filter((type) => type.out).map((type) => type.out) : [],
    errorOutputs: stds ? stds.filter((type) => type.err).map((type) => type.err) : [],
  };
};

module.exports = ({
  api, env, command, std: stds, print = false, token: tokenBehavior = null, ...rest
}) => {
  const {
    nocks, inputs, outputs, errorOutputs,
  } = prepare(api, stds, command, rest);

  return async () => {
    definePrint(print);
    mockEnv(env);
    mockToken(tokenBehavior);
    const stdin = mockStd(outputs, errorOutputs);

    planifyInputs(inputs, stdin);
    await command();

    assertApi(nocks);
    assertOutputs(outputs, errorOutputs);

    rollbackStd(stdin, inputs, outputs, errorOutputs);
    rollbackEnv(env);
    rollbackToken(tokenBehavior);
    rollbackPrint();
  };
};
