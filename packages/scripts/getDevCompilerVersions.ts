import { path } from "./deps.ts";
import { folders } from "./folders.ts";

export function getDevCompilerVersions() {
  const fileData = JSON.parse(Deno.readTextFileSync(path.join(folders.common, "package.json")));
  const dependencies = fileData["devDependencies"];
  const keyRegEx = /^typescript(-[0-9]+\.[0-9]+\.[0-9]+)$/;
  const versionRegEx = /[0-9]+\.[0-9]+\.[0-9]+/;
  const versions: { version: string; name: string }[] = [];

  for (const key of Object.keys(dependencies)) {
    if (!keyRegEx.test(key))
      continue;
    const matches = versionRegEx.exec(dependencies[key]);
    versions.push({ version: matches![0], name: key });
  }

  return versions.sort((a, b) => a.version > b.version ? -1 : 1);
}
