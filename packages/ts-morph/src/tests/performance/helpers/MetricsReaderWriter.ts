import * as fs from "fs";
import * as path from "path";

const ROOT_DIR = path.resolve(__dirname, "../../../../");
const FILE_PATH = path.join(ROOT_DIR, "docs/metrics/performance.json");
const PACKAGE_JSON_FILE_PATH = path.join(ROOT_DIR, "package.json");

interface MetricsFile {
    [id: number]: TestCase;
}

interface TestCase {
    name: string;
    runs: TestRun[];
}

interface TestRun {
    dateTime: number;
    duration: number;
    version: string;
}

export interface RunInfo {
    id: number;
    name: string;
    duration: number;
}

export class MetricsReaderWriter {
    private currentDateTime = Date.now();
    private metricsData: MetricsFile;
    private version: string;

    constructor() {
        this.metricsData = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
        this.version = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE_PATH, "utf8")).version;
    }

    addTestRun(runInfo: RunInfo) {
        const testCase = this.getOrCreateTestCase(runInfo);
        testCase.name = runInfo.name; // always update the name in case it changes

        // remove any previous runs for this version
        for (let i = testCase.runs.length - 1; i >= 0; i--) {
            if (testCase.runs[i].version === this.version)
                testCase.runs.splice(i, 1);
        }

        testCase.runs.push({
            dateTime: this.currentDateTime,
            duration: runInfo.duration,
            version: this.version
        });
    }

    saveSync() {
        fs.writeFileSync(FILE_PATH, JSON.stringify(this.metricsData), "utf8");
        console.log(`Saved metrics to: ${FILE_PATH}`);
    }

    private getOrCreateTestCase(runInfo: RunInfo) {
        return this.metricsData[runInfo.id] = this.metricsData[runInfo.id] || {
            name: runInfo.name,
            runs: []
        };
    }
}
