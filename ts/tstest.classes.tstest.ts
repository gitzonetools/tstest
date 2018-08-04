import * as plugins from "./tstest.plugins";
import { coloredString as cs } from '@pushrocks/consolecolor';

import { TestDirectory } from "./tstest.classes.testdirectory";
import { TapCombinator } from "./tstest.tap.combinator";
import { TapParser } from "./tstest.tap.parser";

export class TsTest {
  testDir: TestDirectory;

  constructor(cwdArg: string, relativePathToTestDirectory: string) {
    this.testDir = new TestDirectory(cwdArg, relativePathToTestDirectory);
  }

  async run() {
    const fileNamesToRun: string[] = await this.testDir.getTestFilePathArray();
    console.log(`Found ${fileNamesToRun.length} Testfile(s):`);
    for (const fileName of fileNamesToRun) {
      console.log(cs(fileName, "orange"));
    }
    console.log("-".repeat(16));
    const smartshellInstance = new plugins.smartshell.Smartshell({
      executor: "bash",
      sourceFilePaths: []
    });
    const tapCombinator = new TapCombinator(); // lets create the TapCombinator
    for (const fileName of fileNamesToRun) {
      console.log(`${cs("=> ", "blue")} Running ${cs(fileName, "orange")}`);
      console.log(`=`.repeat(16));
      const tapParser = new TapParser();
      const execResultStreaming = await smartshellInstance.execStreamingSilent(
        `tsrun ${fileName}`
      );
      await tapParser.handleTapProcess(execResultStreaming.childProcess);
      tapCombinator.addTapParser(tapParser);
    }
    tapCombinator.evaluate();
  }
}
