// ============
// combines different tap test files to an overall result
// ============
import * as plugins from './tstest.plugins';
import { coloredString as cs } from '@pushrocks/consolecolor';

import { TapParser } from './tstest.tap.parser';
import * as logPrefixes from './tstest.logprefixes';

export class TapCombinator {
  tapParserStore: TapParser[] = [];
  addTapParser(tapParserArg: TapParser) {
    this.tapParserStore.push(tapParserArg);
  }

  evaluate() {
    console.log(`${logPrefixes.TsTestPrefix} Ran ${this.tapParserStore.length} Testfiles!`);
    console.log(`${logPrefixes.TsTestPrefix} Here are the overall results:`);
    
    let failGlobal = false; // determine wether tstest should fail
    for (const tapParser of this.tapParserStore) {
      if(tapParser.getErrorTests().length === 0) {
        console.log(
          logPrefixes.TsTestPrefix +
          cs(` ${tapParser.fileName} ${plugins.figures.tick}`, 'green') +
          ' | ' +
          cs(` all tests completed successfully!`, 'blue')
        )
      } else {
        console.log(
          logPrefixes.TsTestPrefix +
          cs(` ${tapParser.fileName} ${plugins.figures.cross}`, 'red') +
          ' | ' +
          cs(` Errors ocurred, please check for the logs!`, 'blue')
        );
        failGlobal = true;
      }
    }
    console.log(cs('-'.repeat(16), 'cyan'));
    console.log(cs('*'.repeat(16), 'cyan'));
    console.log(cs('-'.repeat(16), 'cyan'));
    if(!failGlobal) {
      console.log(cs('Ending with code 0: TESTS ARE PASSING!', 'green'));
    } else {
      console.log(cs('Ending with code 1: TESTS ARE FAILING!', 'red'));
    }
  }
}
