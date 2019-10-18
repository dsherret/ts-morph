import { ArrayUtils } from "@ts-morph/common";
import * as cases from "./cases";
import { PerformanceTestTemplate, MetricsReaderWriter } from "./helpers";
const args = process.argv.slice(2);
const shouldSave = args.some(arg => arg === "--save");
const testCases = ArrayUtils.sortByProperty(
    Object.keys(cases).map(key => new (cases as any)[key]() as PerformanceTestTemplate<any>),
    item => item.id
);

console.log("Performance Tests");
console.log("=================");
console.log("");

const testRunSaver = new MetricsReaderWriter();

for (const testCase of testCases) {
    testRunSaver.addTestRun({
        id: testCase.id,
        name: testCase.name,
        duration: testCase.runTest()
    });
}

if (shouldSave) {
    console.log("");
    testRunSaver.saveSync();
}
