// ============
// combines different tap test files to an overall result
// ============
import * as plugins from './tstest.plugins';
import { coloredString as cs } from '@pushrocks/consolecolor';

import { TapParser } from './tstest.classes.tap.parser';
import * as logPrefixes from './tstest.logprefixes';

export class TapCombinator {
  tapParserStore: TapParser[] = [];
  addTapParser(tapParserArg: TapParser) {
    this.tapParserStore.push(tapParserArg);
  }

  evaluate() {
    console.log(
      `${logPrefixes.TsTestPrefix} RESULTS FOR ${this.tapParserStore.length} TESTFILE(S):`
    );

    let failGlobal = false; // determine wether tstest should fail
    for (const tapParser of this.tapParserStore) {
      if (!tapParser.expectedTests) {
        failGlobal = true;
        let overviewString =
          logPrefixes.TsTestPrefix +
          cs(` ${tapParser.fileName} ${plugins.figures.cross}`, 'red') +
          ` ${plugins.figures.pointer} ` +
          `does not specify tests!`;
        console.log(overviewString);
      } else if (tapParser.expectedTests !== tapParser.receivedTests) {
        failGlobal = true;
        let overviewString =
          logPrefixes.TsTestPrefix +
          cs(` ${tapParser.fileName} ${plugins.figures.cross}`, 'red') +
          ` ${plugins.figures.pointer} ` +
          tapParser.getTestOverviewAsString() +
          `did not execute all specified tests!`;
        console.log(overviewString);
      } else if (tapParser.getErrorTests().length === 0) {
        let overviewString =
          logPrefixes.TsTestPrefix +
          cs(` ${tapParser.fileName} ${plugins.figures.tick}`, 'green') +
          ` ${plugins.figures.pointer} ` +
          tapParser.getTestOverviewAsString();
        console.log(overviewString);
      } else {
        failGlobal = true;
        let overviewString =
          logPrefixes.TsTestPrefix +
          cs(` ${tapParser.fileName} ${plugins.figures.cross}`, 'red') +
          ` ${plugins.figures.pointer} ` +
          tapParser.getTestOverviewAsString();
        console.log(overviewString);
      }
    }
    console.log(cs(plugins.figures.hamburger.repeat(48), 'cyan'));
    if (!failGlobal) {
      console.log(cs('FINAL RESULT: SUCCESS!', 'green'));
    } else {
      console.log(cs('FINAL RESULT: FAIL!', 'red'));
      process.exit(1);
    }
  }
}
