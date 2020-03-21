const mockStdin = require('mock-stdin');
const { stdout, stderr } = require('stdout-stderr');

module.exports = {
  definePrint: (print) => {
    stdout.previousPrint = stdout.print;
    stderr.previousPrint = stderr.print;
    stdout.print = print;
    stderr.print = print;
  },
  mockStd: (outputs, errorOutputs) => {
    const stdin = mockStdin.stdin();
    if (outputs.length) stdout.start();
    if (errorOutputs.length) stderr.start();
    return stdin;
  },
  planifyInputs: (inputs, stdin) => {
    for (let i = 0; i < inputs.length; i += 1) {
      setTimeout(() => stdin.send(`${inputs[i]}\n`), 500 + i * 100);
    }
  },
  assertOutputs: (outputs, errorOutputs) => {
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
  },
  rollbackStd: (stdin, inputs, outputs, errorOutputs) => {
    if (inputs.length) stdin.end();
    if (inputs.length) stdin.reset();
    if (outputs.length) stdout.stop();
    if (errorOutputs.length) stderr.stop();
  },
  rollbackPrint: () => {
    stdout.print = stdout.previousPrint;
    stderr.print = stderr.previousPrint;
    stdout.previousPrint = null;
    stderr.previousPrint = null;
  },
};
