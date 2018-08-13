// ============
// combines different tap test files to an overall result
// ============
import * as plugins from './tstest.plugins';

export class TapTestResult {
  testLogBuffer = Buffer.from('');
  testOk: boolean = false;
  testSettled: boolean = false;
  constructor(public id: number) {}

  /**
   * adds a logLine to the log buffer of the test
   * @param logLine
   */
  addLogLine(logLine: string) {
    logLine = logLine + '\n';
    const logLineBuffer = Buffer.from(logLine);
    this.testLogBuffer = Buffer.concat([this.testLogBuffer, logLineBuffer]);
  }

  setTestResult(testOkArg: boolean) {
    this.testOk = testOkArg;
    this.testSettled = true;
  }
}
