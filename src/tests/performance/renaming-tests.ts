import { Project } from "../../Project";
import { PercentageLogger } from "./helpers";

// todo: improve this overall

describe("renaming @performance tests", () => {
    // todo: these should be benchmarked somewhere
    it("development test", () => {
        measureTest(() => {
            const logger = new PercentageLogger();
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("test.ts");
            const classDec = sourceFile.addClass({ name: "MyClass" });
            for (let i = 0; i < 1000; i++)
                sourceFile.addStatements(`let myVar${i} = new MyClass();`);

            const iterationsCount = 25;
            for (let i = 0; i < iterationsCount; i++) {
                logger.logAsPercentage(i, iterationsCount);
                classDec.rename(`MyClass${i}`);
            }

            console.log("");
        });
    }).timeout(900 * 1000);
});

// todo: do something better here
function measureTest(doTest: () => void) {
    const startTime = new Date();
    doTest();
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log(`Duration: ${duration / 1000}s`);
}
