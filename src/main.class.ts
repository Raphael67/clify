export abstract class CliMainClass {
    protected _: string[] = [];

    abstract async main(done?: (exitCode: number) => void): Promise<number>;

    async stop(exitCode: number): Promise<number> {
        return exitCode;
    }
}