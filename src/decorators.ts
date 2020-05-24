import yargs from 'yargs';
import 'reflect-metadata';
import { CliMainClass } from './main.class';

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
                throw new Error('Your main class should implements CliMain');
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
function run(MainClass: typeof CliMainClass) {
    const main = new MainClass();
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