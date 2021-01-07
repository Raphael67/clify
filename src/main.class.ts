export abstract class CliMainClass {
    abstract async main(done?: (exitCode: number) => void): Promise<number>;

    async stop(exitCode: number): Promise<number> {
        return exitCode;
    }
}