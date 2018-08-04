import { ChildProcess } from 'child_process';
import { coloredString as cs } from '@pushrocks/consolecolor';

// ============
// combines different tap test files to an overall result
// ============
import * as plugins from './tstest.plugins';
import { TapTestResult } from './tstest.tap.testresult';

export class TapParser {
  resultStore: TapTestResult[] = [];

  expectedTestsRegex = /([0-9]*)\.\.([0-9]*)/;
  expectedTests: number;

  testStatusRegex = /(ok|not\sok)\s([0-9]+)\s-\s/;
  activeTapTestResult: TapTestResult;

  private _getNewTapTestResult() {
    this.activeTapTestResult = new TapTestResult(this.resultStore.length + 1);
  }

  private _processLog(logChunk: Buffer | string) {
    if (Buffer.isBuffer(logChunk)) {
      logChunk = logChunk.toString();
    }
    const logLineArray = logChunk.split('\n');
    if (logLineArray[logLineArray.length - 1] === '') {
      logLineArray.pop();
    }

    // lets parse the log information
    for (const logLine of logLineArray) {
      let logLineIsTapProtocol = false;
      if (!this.expectedTests && this.expectedTestsRegex.test(logLine)) {
        logLineIsTapProtocol = true;
        const regexResult = this.expectedTestsRegex.exec(logLine);
        this.expectedTests = parseInt(regexResult[2]);
        console.log(`:::TAP::: Expecting ${this.expectedTests} tests!`);

        // initiating first TapResult
        this._getNewTapTestResult();
      } else if (this.testStatusRegex.test(logLine)) {
        logLineIsTapProtocol = true;
        const regexResult = this.testStatusRegex.exec(logLine);
        const testId = parseInt(regexResult[2]);
        const testOk = (() => {
          if (regexResult[1] === 'ok') {
            return true;
          }
          return false;
        })();

        // test for protocol error
        if (testId !== this.activeTapTestResult.id) {
          console.log(`:::TAP PROTOCOL ERROR::: Something is strange! Test Ids are not equal!`);
        }
        this.activeTapTestResult.setTestResult(testOk);

        if (testOk) {
          console.log(cs(`:::TAP::: Success: Test ${testId} is ok!`, 'green', 'black'));
        } else {
          console.log(cs(`:::TAP::: Error: Test ${testId} is NOT ok!`, 'green', 'black'));
        }
      }

      if (!logLineIsTapProtocol) {
        if (this.activeTapTestResult) {
          this.activeTapTestResult.addLogLine(logLine);
        }
        console.log(logLine);
      }

      if (this.activeTapTestResult && this.activeTapTestResult.testSettled) {
        this.resultStore.push(this.activeTapTestResult);
        this._getNewTapTestResult();
      }
    }
  }

  async handleTapProcess(childProcessArg: ChildProcess) {
    const done = plugins.smartpromise.defer();
    childProcessArg.stdout.on('data', data => {
      this._processLog(data);
    });
    childProcessArg.stderr.on('data', data => {
      this._processLog(data);
    });
    childProcessArg.on('exit', () => {
      done.resolve();
    });
    await done.promise;
  }
}
