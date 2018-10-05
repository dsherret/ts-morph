import { execNpmScript } from "../common";
import { tsVersionsToTest } from "../config";

async function run() {
    // todo: this should pass in which version to use for the tests
    try {
        for (const version of tsVersionsToTest) {
            console.log(`Running tests...`);
            await execNpmScript("test");
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

run();
