import { TsTest } from './tstest.classes.tstest';

export const runCli = async () => {
  const tsTestInstance = new TsTest(process.cwd(), process.argv[2]);
  await tsTestInstance.run();
};
