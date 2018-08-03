import { ChildProcess } from 'child_process';

// ============
// combines different tap test files to an overall result
// ============
import * as plugins from './tstest.plugins';
import { TapTestResult } from './tstest.tap.testresult';

export class TapParser {
  resultStore: TapTestResult[] = [];
  expectedTests: number;

  processLog(logChunk: Buffer | string) {
    if(Buffer.isBuffer(logChunk)) {
      logChunk = logChunk.toString();
    }
    const logLineArray = logChunk.split('\n');
    console.log(logLineArray);
  }

  async handleTapProcess(childProcessArg: ChildProcess) {
    const done = plugins.smartpromise.defer();
    
    await done.promise;
  }
}
