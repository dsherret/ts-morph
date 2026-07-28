import { createDtsMinifier, folders, path, tsMorph } from "./deps.ts";
const { ts } = tsMorph;

const libFilesFilePath = path.join(folders.common, "src/data/libFiles.generated.ts");
// The compiler's own copies, so the checker resolves globals against the library
// it was built against. Reading them from `node_modules/typescript` instead meant
// a TypeScript 7 checker type-checking against TypeScript 6's declarations.
const libFolderPath = path.join(folders.root, "submodules/typescript-go/internal/bundled/libs");
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
