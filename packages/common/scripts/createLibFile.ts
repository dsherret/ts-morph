import { createDtsMinifier, folders, path, tsMorph } from "./deps.ts";
const { ts } = tsMorph;

const libFilesFilePath = path.join(folders.common, "src/data/libFiles.generated.ts");
// todo: grab this from the TypeScript repo's tag
const libFolderPath = path.join(folders.root, "node_modules/typescript/lib");
const minifier = createDtsMinifier(ts);

let libFileText = "// dprint-ignore-file\nexport const libFiles: { fileName: string; text: string; }[] = [";
const entries = Array.from(Deno.readDirSync(libFolderPath));
entries.sort((a, b) => a.name.localeCompare(b.name));

for (const entry of entries) {
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
