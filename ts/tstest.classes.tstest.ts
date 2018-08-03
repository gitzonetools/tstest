import * as plugins from './tstest.plugins';
import { TestDirectory } from './tstest.classes.testdirectory';
import { TapCombinator } from './tstest.tap.combinator';
import { TapParser } from './tstest.tap.parser';

export class TsTest {
  testDir: TestDirectory;

  constructor(cwdArg: string, relativePathToTestDirectory: string) {
    this.testDir = new TestDirectory(cwdArg, relativePathToTestDirectory);
  }

  async run() {
    const fileNamesToRun: string[] = await this.testDir.getTestFilePathArray();
    console.log(`Found ${fileNamesToRun.length} test(s):`);
    for (const fileName of fileNamesToRun) {
      console.log(fileName);
    }
    const smartshellInstance = new plugins.smartshell.Smartshell({
      executor: 'bash',
      sourceFilePaths: []
    });
    const tapCombinator = new TapCombinator(); // lets create the TapCombinator
    for (const fileName of fileNamesToRun) {
      const tapParser = new TapParser();
      const execResultStreaming = await smartshellInstance.execStreamingSilent(`tsrun ${fileName}`);
      await tapParser.handleTapProcess(execResultStreaming.childProcess);
    }
  }
}
