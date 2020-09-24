export { CliMain, CliParameter, KeyPress, Modifiers } from './decorators';
export { CliMainClass } from './main.class';

import readline from 'readline';
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);