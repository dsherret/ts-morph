import { execNpmScript, getDevCompilerVersions, changeTypeScriptVersion, resetTypeScriptVersion } from "../common";

async function run() {
    try {
        const versions = getDevCompilerVersions().map(v => v.version);
        for (let i = 0; i < versions.length; i++) {
            if (i > 0)
                console.log("");

            console.log(`--- TypeScript Version ${versions[i]} ---`);
            changeTypeScriptVersion(versions[i]); // todo: needs to affect declaration files
            console.log(`Type checking declaration files...`);
            await execNpmScript("ensure-no-declaration-file-errors");
            console.log(`Running tests...`);
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
