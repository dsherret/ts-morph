import { execNpmScript, getDevCompilerVersions, changeTypeScriptVersion, resetTypeScriptVersion } from "../common";

async function run() {
    try {
        for (const { version } of getDevCompilerVersions()) {
            console.log(`--- TypeScript Version ${version} ---`);
            console.log(`Type checking...`);
            await execNpmScript("type-check-library");
            console.log(`Running tests...`);
            changeTypeScriptVersion(version);
            await execNpmScript("test");
        }

        resetTypeScriptVersion();
    } catch (err) {
        console.log(err);
        resetTypeScriptVersion();
        process.exit(1);
    }
}

run();
