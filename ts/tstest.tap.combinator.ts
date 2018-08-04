// ============
// combines different tap test files to an overall result
// ============
import * as plugins from './tstest.plugins';
import { coloredString as cs } from '@pushrocks/consolecolor';

import { TapParser } from './tstest.tap.parser';

export class TapCombinator {
  tapParserStore: TapParser[] = [];
  addTapParser(tapParserArg: TapParser) {
    this.tapParserStore.push(tapParserArg);
  }

  evaluate() {
    console.log(`Ran ${this.tapParserStore.length} Testfiles!`);
    for (const tapParser of this.tapParserStore) {

    }
  }
}
