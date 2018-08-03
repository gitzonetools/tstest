import * as plugins from './tstest.plugins';
import * as paths from './tstest.paths';
import { Smartfile } from '@pushrocks/smartfile';

// tap related stuff
import { TapCombinator } from './tstest.tap.combinator';
import { TapParser } from './tstest.tap.parser';
import { TapTestResult } from './tstest.tap.testresult';

export class TestDirectory {
  /**
   * the current working directory
   */
  cwd: string;

  /**
   * the relative location of the test dir
   */
  relativePath: string;

  /**
   * the absolute path of the test dir
   */
  absolutePath: string;

  /**
   * an array of Smartfiles
   */
  testfileArray: Smartfile[] = [];

  /**
   * the constructor for TestDirectory
   * tell it the path
   * @param pathToTestDirectory
   */
  constructor(cwdArg: string, relativePathToTestDirectory: string) {
    this.cwd = cwdArg;
    this.relativePath = relativePathToTestDirectory;
  }

  private async _init() {
    this.testfileArray = await plugins.smartfile.fs.fileTreeToObject(
      plugins.path.join(this.cwd, this.relativePath),
      '**/*.ts'
    );
  }

  async getTestFilePathArray() {
    await this._init();
    const testFilePaths: string[] = [];
    for (const testFile of this.testfileArray) {
      const filePath = plugins.path.join(this.relativePath, testFile.path);
      testFilePaths.push(filePath);
    }
    return testFilePaths;
  }
}
