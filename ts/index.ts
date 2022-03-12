import { TsTest } from './tstest.classes.tstest.js';

export const runCli = async () => {
  if (!process.argv[2]) {
    console.error('You must specify a test directory as argument. Please try again.');
    process.exit(1);
  }
  const tsTestInstance = new TsTest(process.cwd(), process.argv[2]);
  await tsTestInstance.run();
};
