import { execNpmScript, getDevCompilerVersions } from "../common";
import { changeTestTypeScriptVersion, resetTestTypeScriptVersion } from "./changeTestTypeScriptVersion";

async function run() {
    try {
        for (const { version } of getDevCompilerVersions()) {
            console.log(`Running tests for version ${version}...`);
            changeTestTypeScriptVersion(version);
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
