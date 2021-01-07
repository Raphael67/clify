Provide little tool to create your CLI main class in typescript.

## functionalities:

-   Parse command line arguments by adding decorator to your Main class
-   Fill your Main class properties with the command line argument values
-   Create help by analyzing your Main class properties
-   Instantiate and run your Main class
-   Ensure execution of a cleaning function before process exit
-   Handle exit codes

The command line argument parsing is provided by [Yargs](https://www.npmjs.com/package/yargs) under the hood.

## 1. installation

```
npm i --save @corteks/clify
```

Please be sure that your tsconfig file is configured as follow:

```jsonc
"target": "es6", // es6 minimum is mandatory if you need to address older version you will have to recompile this module
"experimentalDecorators": true, // this is mandatory to use decorators
"emitDecoratorMetadata": true // this is mandatory if you want clify to infer argument type from properties
```

## 2. usage

```ts
// Main.ts
import {
    CliMainClass,
    CliParameter,
    CliMain,
    KeyPress,
    Modifiers,
} from '@corteks/clify';

// Decorate your Main class
// Extend the base class
@CliMain
class Main extends CliMainClass {
    // Decorate your parameters with Yargs.Options
    // Mandatory parameters without default value have to be undefined
    // Alias are automatically generated from the first letter of the property name
    @CliParameter({ demandOption: true, description: 'parameter1' })
    private parameter1: string | undefined = undefined;

    // Parameter type is automatically defined from the property type
    // Default yargs options can be override
    @CliParameter({ alias: 'p2' })
    private parameter2: string = 'default';

    // Implement the main() method inherited from the base class
    // this will be automatically launch at startup
    // all properties will have the values defined by the user from the command line
    // Return an exit code at the end
    async main(): Promise<number> {
        console.log(this.parameter1);
        console.log(this.parameter2);

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('timeout');
                resolve();
            }, 5000);
        });

        return 0;
    }

    // Bind function to keyPress event
    // All key bindings are console logged at the start of the software
    // CTRL+c is registered by default and call Main.stop
    @KeyPress('space', Modifiers.NONE, 'This is a test function')
    test() {
        console.log('Space has been pressed.');
    }

    // Implement the stop() method inherited from the base class
    // This function will always be run before the process exit
    // It will receive the exit code of the main() function as parameter
    // The exit code return by the stop() function will be used as the exit code of the process
    async stop(exitCode: number): Promise<number> {
        console.log(exitCode);
        return exitCode;
    }
}
```

If you do not want to exit when the main return, for example when you launch an async process, use the `done(exitCode: number) => void` callback passed as the `main` function parameter:

```ts
// Main.ts
// ...
@CliMain
class Main extends CliMainClass {
    // ...
    async main(done: (exitCode: number) => void): Promise<number> {
        myAsyncProcess()
            .then(() => {
                done(0)
            })
            .catch(() => {
                done(1)
            })

        return 0;
    }

    // ...
    async stop(exitCode: number): Promise<number> {
        console.log(exitCode);
        return exitCode;
    }
}
```

## Results

```
bash> ./my_cli

Options:
  --help              Affiche l'aide                                   [booléen]
  --version           Affiche le numéro de version                     [booléen]
  --parameter1, -p    parameter1                                        [requis]
  --parameter2, --p2  parameter2     [chaîne de caractères] [défaut : "default"]

Argument requis manquant : parameter1
```
