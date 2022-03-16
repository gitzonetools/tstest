import * as plugins from './tstest.plugins.js';
import * as paths from './tstest.paths.js';
import * as logPrefixes from './tstest.logprefixes.js';

import { coloredString as cs } from '@pushrocks/consolecolor';

import { TestDirectory } from './tstest.classes.testdirectory.js';
import { TapCombinator } from './tstest.classes.tap.combinator.js';
import { TapParser } from './tstest.classes.tap.parser.js';

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
      switch (true) {
        case process.env.CI && fileNameArg.includes('.nonci.'):
          console.log('!!!!!!!!!!!');
          console.log(
            `not running testfile ${fileNameArg}, sinc we are CI and file name includes '.nonci.' tag`
          );
          console.log('!!!!!!!!!!!');
          break;
        case fileNameArg.endsWith('.browser.ts'):
          const tapParserBrowser = await this.runInChrome(fileNameArg);
          tapCombinator.addTapParser(tapParserBrowser);
          break;
        case fileNameArg.endsWith('.both.ts'):
          console.log('>>>>>>> TEST PART 1: chrome');
          const tapParserBothBrowser = await this.runInChrome(fileNameArg);
          tapCombinator.addTapParser(tapParserBothBrowser);
          console.log(cs(`|`.repeat(16), 'cyan'));
          console.log(''); // force new line
          console.log('>>>>>>> TEST PART 2: node');
          const tapParserBothNode = await this.runInNode(fileNameArg);
          tapCombinator.addTapParser(tapParserBothNode);
          break;
        default:
          const tapParserNode = await this.runInNode(fileNameArg);
          tapCombinator.addTapParser(tapParserNode);
          break;
      }

      console.log(cs(`^`.repeat(16), 'cyan'));
      console.log(''); // force new line
    }
    tapCombinator.evaluate();
  }

  public async runInNode(fileNameArg: string): Promise<TapParser> {
    console.log(`${cs('=> ', 'blue')} Running ${cs(fileNameArg, 'orange')} in node.js runtime.`);
    console.log(`${cs(`= `.repeat(32), 'cyan')}`);
    const tapParser = new TapParser(fileNameArg + ':node');

    // tsrun options
    let tsrunOptions = '';
    if (process.argv.includes('--web')) {
      tsrunOptions += ' --web';
    }

    const execResultStreaming = await this.smartshellInstance.execStreamingSilent(
      `tsrun ${fileNameArg}${tsrunOptions}`
    );
    await tapParser.handleTapProcess(execResultStreaming.childProcess);
    return tapParser;
  }

  public async runInChrome(fileNameArg: string): Promise<TapParser> {
    console.log(`${cs('=> ', 'blue')} Running ${cs(fileNameArg, 'orange')} in chromium runtime.`);
    console.log(`${cs(`= `.repeat(32), 'cyan')}`);

    // lets get all our paths sorted
    const tsbundleCacheDirPath = plugins.path.join(paths.cwd, './.nogit/tstest_cache');
    const bundleFileName = fileNameArg.replace('/', '__') + '.js';
    const bundleFilePath = plugins.path.join(tsbundleCacheDirPath, bundleFileName);

    // lets bundle the test
    await plugins.smartfile.fs.ensureEmptyDir(tsbundleCacheDirPath);
    await this.tsbundleInstance.build(process.cwd(), fileNameArg, bundleFilePath, {
      bundler: 'esbuild'
    });

    // lets create a server
    const server = new plugins.smartexpress.Server({
      cors: true,
      port: 3007,
    });
    server.addRoute(
      '/test',
      new plugins.smartexpress.Handler('GET', async (req, res) => {
        res.type('.html');
        res.write(`
        <html>
          <head>
            <script>
              globalThis.testdom = true;
            </script>
          </head>
          <body></body>
        </html>
      `);
        res.end();
      })
    );
    server.addRoute('*', new plugins.smartexpress.HandlerStatic(tsbundleCacheDirPath));
    await server.start();

    // lets do the browser bit
    await this.smartbrowserInstance.start();
    const evaluation = await this.smartbrowserInstance.evaluateOnPage(
      `http://localhost:3007/test?bundleName=${bundleFileName}`,
      async () => {
        const convertToText = (obj: any): string => {
          // create an array that will later be joined into a string.
          const stringArray = [];

          if (typeof obj === 'object' && typeof obj.toString === 'function') {
            stringArray.push(obj.toString());
          } else if (typeof obj === 'object' && obj.join === undefined) {
            stringArray.push('{');
            for (const prop of Object.keys(obj)) {
              stringArray.push(prop, ': ', convertToText(obj[prop]), ',');
            }
            stringArray.push('}');

            // is array
          } else if (typeof obj === 'object' && !(obj.join === undefined)) {
            stringArray.push('[');
            for (const prop of Object.keys(obj)) {
              stringArray.push(convertToText(obj[prop]), ',');
            }
            stringArray.push(']');

            // is function
          } else if (typeof obj === 'function') {
            stringArray.push(obj.toString());

            // all other values can be done with JSON.stringify
          } else {
            stringArray.push(JSON.stringify(obj));
          }

          return stringArray.join('');
        };

        let logStore = '';
        // tslint:disable-next-line: max-classes-per-file
        const log = console.log.bind(console);
        console.log = (...args) => {
          args = args.map((argument) => {
            return typeof argument !== 'string' ? convertToText(argument) : argument;
          });
          logStore += `${args}\n`;
          log(...args);
        };
        const error = console.error;
        console.error = (...args) => {
          args = args.map((argument) => {
            return typeof argument !== 'string' ? convertToText(argument) : argument;
          });
          logStore += `${args}\n`;
          error(...args);
        };
        const bundleName = new URLSearchParams(window.location.search).get('bundleName');
        console.log(`::TSTEST IN CHROMIUM:: Relevant Script name is: ${bundleName}`);
        const bundleResponse = await fetch(`/${bundleName}`);
        console.log(
          `::TSTEST IN CHROMIUM:: Got ${bundleName} with STATUS ${bundleResponse.status}`
        );
        const bundle = await bundleResponse.text();
        console.log(`::TSTEST IN CHROMIUM:: Executing ${bundleName}`);
        try {
          // tslint:disable-next-line: no-eval
          eval(bundle);
        } catch (err) {
          console.error(err);
        }

        if (
          (globalThis as any).tapbundleDeferred &&
          (globalThis as any).tapbundleDeferred.promise
        ) {
          await (globalThis as any).tapbundleDeferred.promise;
        } else {
          console.log('Error: Could not find tapbundle Deferred');
        }
        return logStore;
      }
    );
    await this.smartbrowserInstance.stop();
    await server.stop();
    console.log(
      `${cs('=> ', 'blue')} Stopped ${cs(fileNameArg, 'orange')} chromium instance and server.`
    );
    console.log(`${cs('=> ', 'blue')} See the result captured from the chromium execution:`);
    // lets create the tap parser
    const tapParser = new TapParser(fileNameArg + ':chrome');
    tapParser.handleTapLog(evaluation);
    return tapParser;
  }

  public async runInDeno() {}
}
