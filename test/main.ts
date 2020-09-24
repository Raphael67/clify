import { CliMainClass, CliParameter, CliMain, KeyPress, Modifiers } from '../lib/index';

@CliMain
class Main extends CliMainClass {
    @CliParameter({ demandOption: true, description: 'parameter1' })
    private parameter1: string | undefined = undefined;

    @CliParameter({ alias: 'p2' })
    private parameter2: string = 'default';

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

    @KeyPress('space', Modifiers.NONE, 'This is a test function')
    test() {
        console.log('Space has been pressed.');
    }

    async stop(exitCode: number): Promise<number> {
        console.log(exitCode);
        return exitCode;
    }
}