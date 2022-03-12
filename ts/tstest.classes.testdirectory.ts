import * as plugins from './tstest.plugins.js';
import * as paths from './tstest.paths.js';
import { Smartfile } from '@pushrocks/smartfile';

// tap related stuff
import { TapCombinator } from './tstest.classes.tap.combinator.js';
import { TapParser } from './tstest.classes.tap.parser.js';
import { TapTestResult } from './tstest.classes.tap.testresult.js';

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
      'test*.ts'
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
