import * as plugins from './tstest.plugins';
import * as paths from './tstest.paths';
import * as logPrefixes from './tstest.logprefixes';

import { coloredString as cs } from '@pushrocks/consolecolor';

import { TestDirectory } from './tstest.classes.testdirectory';
import { TapCombinator } from './tstest.classes.tap.combinator';
import { TapParser } from './tstest.classes.tap.parser';

export class TsTest {
  testDir: TestDirectory;

  constructor(cwdArg: string, relativePathToTestDirectory: string) {
    this.testDir = new TestDirectory(cwdArg, relativePathToTestDirectory);
  }

  async run() {
    const fileNamesToRun: string[] = await this.testDir.getTestFilePathArray();
    console.log(cs(plugins.figures.hamburger.repeat(80), 'cyan'));
    console.log('');
    console.log(`${logPrefixes.TsTestPrefix} FOUND ${fileNamesToRun.length} TESTFILE(S):`);
    for (const fileName of fileNamesToRun) {
      console.log(`${logPrefixes.TsTestPrefix} ${cs(fileName, 'orange')}`);
    }
    console.log('-'.repeat(48));
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

      // tsrun options
      let tsrunOptions = ''
      if(process.argv.includes('--web')) {
        tsrunOptions += ' --web'
      }

      const execResultStreaming = await smartshellInstance.execStreamingSilent(`tsrun ${fileName}${tsrunOptions}`);
      await tapParser.handleTapProcess(execResultStreaming.childProcess);
      console.log(cs(`^`.repeat(16), 'cyan'));
      console.log(''); // force new line
      tapCombinator.addTapParser(tapParser);
    }
    tapCombinator.evaluate();
  }
}
