import * as fs from "fs";
import * as path from "path";

export function getDevCompilerVersions() {
    const fileData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../common/package.json"), "utf-8"));
    const dependencies = fileData["devDependencies"];
    const keyRegEx = /^typescript(-[0-9]+\.[0-9]+\.[0-9]+)$/;
    const versionRegEx = /[0-9]+\.[0-9]+\.[0-9]+/;
    const versions: { version: string; name: string; }[] = [];

    for (const key of Object.keys(dependencies)) {
        if (!keyRegEx.test(key))
            continue;
        const matches = versionRegEx.exec(dependencies[key]);
        versions.push({ version: matches![0], name: key });
    }

    return versions.sort((a, b) => a.version > b.version ? -1 : 1);
}
