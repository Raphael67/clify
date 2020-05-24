export abstract class CliMainClass {
    abstract async main(): Promise<number>;

    async stop(exitCode: number): Promise<number> {
        return exitCode;
    }
}