import { ChildProcess } from 'child_process';
import { coloredString as cs } from '@pushrocks/consolecolor';

// ============
// combines different tap test files to an overall result
// ============
import * as plugins from './tstest.plugins';
import { TapTestResult } from './tstest.classes.tap.testresult';
import * as logPrefixes from './tstest.logprefixes';

export class TapParser {
  testStore: TapTestResult[] = [];

  expectedTestsRegex = /([0-9]*)\.\.([0-9]*)$/;
  expectedTests: number;
  receivedTests: number;

  testStatusRegex = /(ok|not\sok)\s([0-9]+)\s-\s(.*)\s#\stime=(.*)ms$/;
  activeTapTestResult: TapTestResult;

  /**
   * the constructor for TapParser
   */
  constructor(public fileName: string) {}

  private _getNewTapTestResult() {
    this.activeTapTestResult = new TapTestResult(this.testStore.length + 1);
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
        console.log(
          `${logPrefixes.TapPrefix} ${cs(`Expecting ${this.expectedTests} tests!`, 'blue')}`
        );

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

        const testSubject = regexResult[3];
        const testDuration = parseInt(regexResult[4]);

        // test for protocol error
        if (testId !== this.activeTapTestResult.id) {
          console.log(
            `${logPrefixes.TapErrorPrefix} Something is strange! Test Ids are not equal!`
          );
        }
        this.activeTapTestResult.setTestResult(testOk);

        if (testOk) {
          console.log(
            logPrefixes.TapPrefix,
            `${cs(`T${testId} ${plugins.figures.tick}`, 'green')} ${plugins.figures.arrowRight} ` +
              cs(testSubject, 'blue') +
              ` | ${cs(`${testDuration} ms`, 'orange')}`
          );
        } else {
          console.log(
            logPrefixes.TapPrefix,
            `${cs(`T${testId} ${plugins.figures.cross}`, 'red')} ${plugins.figures.arrowRight} ` +
              cs(testSubject, 'blue') +
              ` | ${cs(`${testDuration} ms`, 'orange')}`
          );
        }
      }

      if (!logLineIsTapProtocol) {
        if (this.activeTapTestResult) {
          this.activeTapTestResult.addLogLine(logLine);
        }
        console.log(logLine);
      }

      if (this.activeTapTestResult && this.activeTapTestResult.testSettled) {
        this.testStore.push(this.activeTapTestResult);
        this._getNewTapTestResult();
      }
    }
  }

  /**
   * returns all tests that are not completed
   */
  public getUncompletedTests() {
    // TODO:
  }

  /**
   * returns all tests that threw an error
   */
  public getErrorTests() {
    return this.testStore.filter((tapTestArg) => {
      return !tapTestArg.testOk;
    });
  }

  /**
   * returns a test overview as string
   */
  getTestOverviewAsString() {
    let overviewString = '';
    for (const test of this.testStore) {
      if (overviewString !== '') {
        overviewString += ' | ';
      }
      if (test.testOk) {
        overviewString += cs(`T${test.id} ${plugins.figures.tick}`, 'green');
      } else {
        overviewString += cs(`T${test.id} ${plugins.figures.cross}`, 'red');
      }
    }
    return overviewString;
  }

  /**
   * handles a tap process
   * @param childProcessArg
   */
  public async handleTapProcess(childProcessArg: ChildProcess) {
    const done = plugins.smartpromise.defer();
    childProcessArg.stdout.on('data', (data) => {
      this._processLog(data);
    });
    childProcessArg.stderr.on('data', (data) => {
      this._processLog(data);
    });
    childProcessArg.on('exit', async () => {
      await this._evaluateResult();
      done.resolve();
    });
    await done.promise;
  }

  public async handleTapLog(tapLog: string) {
    this._processLog(tapLog);
    await this._evaluateResult();
  }

  private async _evaluateResult() {
    this.receivedTests = this.testStore.length;

    // check wether all tests ran
    if (this.expectedTests === this.receivedTests) {
      console.log(
        `${logPrefixes.TapPrefix} ${cs(
          `${this.receivedTests} out of ${this.expectedTests} Tests completed!`,
          'green'
        )}`
      );
    } else {
      console.log(
        `${logPrefixes.TapErrorPrefix} ${cs(
          `Only ${this.receivedTests} out of ${this.expectedTests} completed!`,
          'red'
        )}`
      );
    }
    if (this.getErrorTests().length === 0) {
      console.log(`${logPrefixes.TapPrefix} ${cs(`All tests are successfull!!!`, 'green')}`);
    } else {
      console.log(
        `${logPrefixes.TapPrefix} ${cs(
          `${this.getErrorTests().length} tests threw an error!!!`,
          'red'
        )}`
      );
    }
  }
}
