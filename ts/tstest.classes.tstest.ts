import * as plugins from './tstest.plugins';
import * as paths from './tstest.paths';
import * as logPrefixes from './tstest.logprefixes';

import { coloredString as cs } from '@pushrocks/consolecolor';

import { TestDirectory } from './tstest.classes.testdirectory';
import { TapCombinator } from './tstest.classes.tap.combinator';
import { TapParser } from './tstest.classes.tap.parser';
import { threeEighths } from 'figures';

export class TsTest {
  public testDir: TestDirectory;

  public smartshellInstance = new plugins.smartshell.Smartshell({
    executor: 'bash',
    pathDirectories: [paths.binDirectory],
    sourceFilePaths: [],
  });
  public smartbrowserInstance = new plugins.smartbrowser.SmartBrowser();

  public tsbundleInstance = new plugins.tsbundle.TsBundle();

  constructor(cwdArg: string, relativePathToTestDirectory: string) {
    this.testDir = new TestDirectory(cwdArg, relativePathToTestDirectory);
  }

  async run() {
    const fileNamesToRun: string[] = await this.testDir.getTestFilePathArray();
    console.log(cs(plugins.figures.hamburger.repeat(80), 'cyan'));
    console.log('');
    console.log(`${logPrefixes.TsTestPrefix} FOUND ${fileNamesToRun.length} TESTFILE(S):`);
    for (const fileName of fileNamesToRun) {
      console.log(`${logPrefixes.TsTestPrefix} ${cs(fileName, 'orange')}`);
    }
    console.log('-'.repeat(48));
    console.log(''); // force new line
    
    const tapCombinator = new TapCombinator(); // lets create the TapCombinator
    for (const fileNameArg of fileNamesToRun) {
      let tapParser: TapParser;
      switch(true) {
        case fileNameArg.endsWith('.browser.ts'):
          tapParser = await this.runInChrome(fileNameArg);
          break;
        default:
          tapParser = await this.runInNode(fileNameArg);
          break;
      }
      tapCombinator.addTapParser(tapParser);
    }
    tapCombinator.evaluate();
  }

  public async runInNode(fileNameArg: string): Promise<TapParser> {
    console.log(`${cs('=> ', 'blue')} Running ${cs(fileNameArg, 'orange')} in node.js runtime.`);
    console.log(cs(`=`.repeat(16), 'cyan'));
    const tapParser = new TapParser(fileNameArg);

    // tsrun options
    let tsrunOptions = '';
    if (process.argv.includes('--web')) {
      tsrunOptions += ' --web';
    }

    const execResultStreaming = await this.smartshellInstance.execStreamingSilent(
      `tsrun ${fileNameArg}${tsrunOptions}`
    );
    await tapParser.handleTapProcess(execResultStreaming.childProcess);
    console.log(cs(`^`.repeat(16), 'cyan'));
    console.log(''); // force new line
    return tapParser;
  }

  public async runInChrome(fileNameArg: string): Promise<TapParser> {
    console.log(`${cs('=> ', 'blue')} Running ${cs(fileNameArg, 'orange')} in chromium runtime.`);
    console.log(cs(`=`.repeat(16), 'cyan'));
    
    // lets get all our paths sorted
    const tsbundleCacheDirPath = plugins.path.join(paths.cwd, './.nogit/tstest_cache');
    const bundleFileName = fileNameArg.replace('/', '__') + '.js';
    const bundleFilePath = plugins.path.join(tsbundleCacheDirPath, bundleFileName);
    
    // lets bundle the test
    await plugins.smartfile.fs.ensureDir(tsbundleCacheDirPath);
    await this.tsbundleInstance.buildTest(fileNameArg, bundleFilePath, 'parcel');
    
    // lets create a server
    const server = new plugins.smartexpress.Server({
      cors: true,
      port: 3007
    });
    server.addRoute('/test', new plugins.smartexpress.Handler('GET', async (req, res) => {
      res.type('.html');
      res.write(`
        <html>
          <head></head>
          <body></body>
        </html>
      `);
      res.end();
    }));
    server.addRoute('*', new plugins.smartexpress.HandlerStatic(tsbundleCacheDirPath));
    await server.start();

    // lets do the browser bit
    await this.smartbrowserInstance.start();
    const evaluation = await this.smartbrowserInstance.evaluateOnPage('http://localhost:3007/test', async () => {
      const logStore = 'hello';
      const log = console.log.bind(console);
      console.log = (...args) => {
        log('My Console!!!');
        log(...args);
      };
      const script = document.createElement('script');
      script.src = '/test__test.browser.ts.js';
      document.head.appendChild(script);
      return logStore;
    });
    await plugins.smartdelay.delayFor(1000);
    await this.smartbrowserInstance.stop();
    console.log(`${cs('=> ', 'blue')} Stopped ${cs(fileNameArg, 'orange')} chromium instance.`);
    await server.stop();
    console.log(`${cs('=> ', 'blue')} Stopped ${cs(fileNameArg, 'orange')} server.`);
    // lets create the tap parser
    const tapParser = new TapParser(fileNameArg);
    tapParser.handleTapLog(evaluation);
    return tapParser;
  }

  public async runInDeno() {}
}
