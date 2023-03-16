import { createDtsMinifier, folders, path, tsMorph } from "./deps.ts";
const { ts } = tsMorph;

const libFilesFilePath = path.join(folders.common, "src/data/libFiles.ts");
// todo: grab this from the TypeScript repo's tag
const libFolderPath = path.join(folders.common, "node_modules/typescript/lib");
const minifier = createDtsMinifier(ts);

let libFileText = "// dprint-ignore-file\nexport const libFiles: { fileName: string; text: string; }[] = [";

for (const entry of Deno.readDirSync(libFolderPath)) {
  const isLibFile = entry.isFile && entry.name.startsWith("lib") && entry.name.endsWith(".d.ts");
  if (!isLibFile)
    continue;
  const filePath = path.join(libFolderPath, entry.name);
  const fileText = Deno.readTextFileSync(filePath);

  if (libFileText.endsWith("}"))
    libFileText += ", ";

  libFileText += `{\n`
    + `    fileName: "${entry.name}",\n`
    + `    text: "${minifier.minify(fileText).replace(/\r?\n/g, "\\n").replace(/"/g, "\\\"")}"\n`
    + `}`;
}

libFileText += "];\n";

Deno.writeTextFileSync(
  libFilesFilePath,
  libFileText,
);
