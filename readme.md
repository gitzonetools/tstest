# @gitzone/tstest
a test utility to run tests that match test/**/*.ts

## Availabililty and Links
* [npmjs.org (npm package)](https://www.npmjs.com/package/@gitzone/tstest)
* [gitlab.com (source)](https://gitlab.com/gitzone/tstest)
* [github.com (source mirror)](https://github.com/gitzone/tstest)
* [docs (typedoc)](https://gitzone.gitlab.io/tstest/)

## Status for master

Status Category | Status Badge
-- | --
GitLab Pipelines | [![pipeline status](https://gitlab.com/gitzone/tstest/badges/master/pipeline.svg)](https://lossless.cloud)
GitLab Pipline Test Coverage | [![coverage report](https://gitlab.com/gitzone/tstest/badges/master/coverage.svg)](https://lossless.cloud)
npm | [![npm downloads per month](https://badgen.net/npm/dy/@gitzone/tstest)](https://lossless.cloud)
Snyk | [![Known Vulnerabilities](https://badgen.net/snyk/gitzone/tstest)](https://lossless.cloud)
TypeScript Support | [![TypeScript](https://badgen.net/badge/TypeScript/>=%203.x/blue?icon=typescript)](https://lossless.cloud)
node Support | [![node](https://img.shields.io/badge/node->=%2010.x.x-blue.svg)](https://nodejs.org/dist/latest-v10.x/docs/api/)
Code Style | [![Code Style](https://badgen.net/badge/style/prettier/purple)](https://lossless.cloud)
PackagePhobia (total standalone install weight) | [![PackagePhobia](https://badgen.net/packagephobia/install/@gitzone/tstest)](https://lossless.cloud)
PackagePhobia (package size on registry) | [![PackagePhobia](https://badgen.net/packagephobia/publish/@gitzone/tstest)](https://lossless.cloud)
BundlePhobia (total size when bundled) | [![BundlePhobia](https://badgen.net/bundlephobia/minzip/@gitzone/tstest)](https://lossless.cloud)
Platform support | [![Supports Windows 10](https://badgen.net/badge/supports%20Windows%2010/yes/green?icon=windows)](https://lossless.cloud) [![Supports Mac OS X](https://badgen.net/badge/supports%20Mac%20OS%20X/yes/green?icon=apple)](https://lossless.cloud)

## Usage

## cli usage

lets assume we have a directory called test/ where all our tests arae defined. Simply type

```
tstest test/
```

to run all tests.

## Syntax

tstest supports tap syntax. In other words your testfiles are run in a subprocess, and the console output contains trigger messages for tstest to determine test status. Inside your testfile you should use `@pushrocks/tapbundle` for the best results.

## Environments

tstest supports different environments:

- a testfile called `test-something.node.ts` will be run in node
- a testfile called `test-something.chrome.ts` will be run in chrome environment (bundled through parcel and run through puppeteer)
- a testfile called `test-something.both.ts` will be run in node an chrome, which is good for isomorphic packages.

> note: there is alpha support for the deno environment by naming a file test-something.deno.ts

## Contribution

We are always happy for code contributions. If you are not the code contributing type that is ok. Still, maintaining Open Source repositories takes considerable time and thought. If you like the quality of what we do and our modules are useful to you we would appreciate a little monthly contribution: You can [contribute one time](https://lossless.link/contribute-onetime) or [contribute monthly](https://lossless.link/contribute). :)

For further information read the linked docs at the top of this readme.

> MIT licensed | **&copy;** [Lossless GmbH](https://lossless.gmbh)
| By using this npm module you agree to our [privacy policy](https://lossless.gmbH/privacy)

[![repo-footer](https://lossless.gitlab.io/publicrelations/repofooter.svg)](https://maintainedby.lossless.com)
