import { changeTypeScriptVersion, execNpmScript, folders, getDevCompilerVersions, resetTypeScriptVersion } from "../../../scripts/mod.ts";

async function run() {
  try {
    const versions = getDevCompilerVersions().map(v => v.version);
    for (let i = 0; i < versions.length; i++) {
      if (i > 0)
        console.log("");

      console.log(`--- TypeScript Version ${versions[i]} ---`);
      changeTypeScriptVersion(versions[i]);
      console.log(`Type checking declaration files and running tests...`);
      await Promise.all([
        // execNpmScript("ensure-no-declaration-file-errors", rootFolder),
        execNpmScript("test", folders.root),
      ]);
    }

    resetTypeScriptVersion();
  } catch (err) {
    console.log(err);
    resetTypeScriptVersion();
    Deno.exit(1);
  }
}

run();
