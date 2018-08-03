import * as plugins from './tstest.plugins';

export const cwd = process.cwd();
export const testDir = plugins.path.join(cwd, './test/');
