import { PercentageLogger } from "./PercentageLogger";

export abstract class PerformanceTestTemplate<TSetupResult> {
    private readonly logger = new PercentageLogger();

    runTest() {
        process.stdout.write(`  Running test: ${this.name} `);
        const setupResult = this.setup();
        const duration = this.runAndMeasure(setupResult);
        this.logger.finish();
        console.log(`    Duration: ${duration / 1000}s`);
        return duration;
    }

    abstract id: number;
    abstract name: string;

    protected abstract setup(): TSetupResult;
    protected abstract runInternal(value: TSetupResult, reportProgress: (index: number, count: number) => void): void;

    private runAndMeasure(setupResult: TSetupResult) {
        const startTime = Date.now();
        this.runInternal(setupResult, (index, count) => this.logger.logAsPercentage(index, count));
        const endTime = Date.now();
        const duration = endTime - startTime;
        return duration;
    }
}
