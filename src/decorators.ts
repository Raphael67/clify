import yargs from 'yargs';
import 'reflect-metadata';
import { CliMainClass } from './main.class';
import readline from 'readline';

let main: CliMainClass & { [key: string]: () => any; };
const metadata: { [key: string]: any; } = {};

/**
 * Register all properties decorated with CliParameter as yargs options
 */
export function CliParameter(options: yargs.Options = {}) {
    return (target: any, propertyKey: string) => {
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        if (type) options.type = options.type || type.name.toLowerCase();
        options.alias = options.alias || propertyKey.substring(0, 1);
        metadata[propertyKey] = options;
    };
}

const functions = new Map<string, [string, string]>();

export enum Modifiers {
    NONE = 0,
    CTRL = 1,
    META = 2,
    SHIFT = 4
}

type ModifierFlag = number;

/**
 * 
 * @param key The key name
 * @param modifiers A set of (Modifiers.CTRL, Modifiers.META, Modifiers.SHIFT)
 * 
 * Launch a function when the specified keys are pressed.
 */
export function KeyPress(key: string, modifiers: ModifierFlag = Modifiers.NONE, description: string = '') {
    return (target: any, propertyKey: string) => {
        functions.set(key + modifiers, [propertyKey, description]);
    };
}

/**
 * Initialize yargs with all options registered at once, to prevent truncated help 
 * message if one failed.
 * Alter the constructor to fill the properties with the command line parameters
 * parsed by yargs.
 * Finally run the main.
 */
export function CliMain<T extends { new(...args: any[]): {}; }>(constructor: T) {
    const MainClass: typeof CliMainClass = class extends constructor {
        constructor(...rest: any[]) {
            super();
            if (!(this instanceof CliMainClass)) {
                throw new Error('Your main class should implement CliMain');
            }
            for (let propertyKey in metadata) {
                metadata[propertyKey].default = (this as any)[propertyKey];
            }
            const args = yargs.options(metadata).argv;
            for (let propertyKey in metadata) {
                if (metadata[propertyKey])
                    (this as any)[propertyKey] = args[propertyKey];
            }
        }
    } as any;
    run(MainClass);
}

/**
 * This function runs the main() and get the returned number.
 * This number is used as an exit code.
 * It runs the stop function at the end to allow cleaning resources
 * and passes the exit code as a parameter.
 * Finally calls process.exit with the exit code.
 */
function run(MainClass: any) {
    readline.emitKeypressEvents(process.stdin);
    if (functions.size > 0) {
        if (!process.stdin.setRawMode) {
        process.stdout.write('Warning: process.stdin.setRawMode is not available.\n');
        process.stdout.write('Warning: KeyPress event won\'t be detected.\n');
        process.stdout.write('Warning: If you are using nodemon try --no-stdin parameter.\n');
        functions.clear();
    } else {
        process.stdin.setRawMode(true);
    }
    }

    main = new MainClass();

    functions.forEach((value, key) => {
        let bind = '';
        const modifiers = parseInt(key.substr(-1), 10);
        if (modifiers & Modifiers.CTRL) bind += 'CTRL + ';
        if (modifiers & Modifiers.META) bind += 'META + ';
        if (modifiers & Modifiers.SHIFT) bind += 'SHIFT + ';
        bind += key.substring(0, key.length - 1);

        const description = value[1] || value[0];
        process.stdout.write(`* [${bind}] => ${description}\n`);
    });

    process.stdin.on('keypress', (str, key: { name: string, ctrl: boolean, meta: boolean, shift: boolean; }) => {
        if (key.ctrl && key.name === 'c') quit();

        const modifiers = +key.ctrl | (+key.meta << 1) | (+key.shift << 2);
        const fun = functions.get(key.name + modifiers);
        if (fun) main[fun[0]]();
    });

    process.on('SIGINT', async () => {
        await quit();
    });

    process.on('SIGTERM', async () => {
        await quit();
    });

    let exitCode = 1;
    main.main()
        .then((returnValue: number) => {
            exitCode = returnValue;
        })
        .finally(() => {
            return main.stop(exitCode);
        })
        .finally(() => {
            process.exit(exitCode);
        });
}

function quit() {
    return main.stop(1)
        .finally(() => {
            process.exit();
        });
}