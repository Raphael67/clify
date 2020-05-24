import { CliMainClass, CliParameter, CliMain } from '../lib/index';

@CliMain
class Main extends CliMainClass {
    @CliParameter({ demandOption: true, description: 'parameter' })
    private parameter: string | undefined = undefined;

    @CliParameter({ description: 'parameter2' })
    private parameter2: string = 'default';

    async main(): Promise<number> {
        console.log(this.parameter);
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('timeout');
                resolve();
            }, 5000);
        });
        return 0;
    }

    async stop(exitCode: number): Promise<number> {
        console.log(exitCode);
        return exitCode;
    }
}