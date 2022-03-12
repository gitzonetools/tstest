import * as plugins from './tstest.plugins.js';
import { coloredString as cs } from '@pushrocks/consolecolor';

export const TapPrefix = cs(`::TAP::`, 'pink', 'black');
export const TapErrorPrefix = cs(` !!!TAP PROTOCOL ERROR!!! `, 'red', 'black');

export const TsTestPrefix = cs(`**TSTEST**`, 'pink', 'black');
