import { execNpmScript } from "../common";
import { tsVersionsToTest } from "../config";
import { changeTestTypeScriptVersion, resetTestTypeScriptVersion } from "./changeTestTypeScriptVersion"

async function run() {
    try {
        for (const version of tsVersionsToTest) {
            console.log(`Changing to version ${version}...`);
            changeTestTypeScriptVersion(version);
            console.log(`Running tests...`);
            await execNpmScript("test");
        }

        resetTestTypeScriptVersion();
    } catch (err) {
        console.log(err);
        resetTestTypeScriptVersion();
        process.exit(1);
    }
}

run();
