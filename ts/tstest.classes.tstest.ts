import * as plugins from './tstest.plugins';
import * as paths from './tstest.paths';
import * as logPrefixes from './tstest.logprefixes';

import { coloredString as cs } from '@pushrocks/consolecolor';

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
    console.log(`${logPrefixes.TsTestPrefix} Found ${fileNamesToRun.length} Testfile(s):`);
    for (const fileName of fileNamesToRun) {
      console.log(`${logPrefixes.TsTestPrefix} ${cs(fileName, 'orange')}`);
    }
    console.log('-'.repeat(16));
    console.log(''); // force new line
    const smartshellInstance = new plugins.smartshell.Smartshell({
      executor: 'bash',
      pathDirectories: [paths.binDirectory],
      sourceFilePaths: []
    });
    const tapCombinator = new TapCombinator(); // lets create the TapCombinator
    for (const fileName of fileNamesToRun) {
      console.log(`${cs('=> ', 'blue')} Running ${cs(fileName, 'orange')}`);
      console.log(cs(`=`.repeat(16), 'cyan'));
      const tapParser = new TapParser(fileName);
      const execResultStreaming = await smartshellInstance.execStreamingSilent(`tsrun ${fileName}`);
      await tapParser.handleTapProcess(execResultStreaming.childProcess);
      console.log(cs(`^`.repeat(16), 'cyan'));
      console.log(''); // force new line
      tapCombinator.addTapParser(tapParser);
    }
    tapCombinator.evaluate();
  }
}
