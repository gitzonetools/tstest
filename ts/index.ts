import { TsTest } from './tstest.classes.tstest';

const cliRun = async () => {
  if (process.env.CLI_CALL) {
    const tsTestInstance = new TsTest(process.cwd(), process.argv[2]);
    await tsTestInstance.run();
  }
};
cliRun();
