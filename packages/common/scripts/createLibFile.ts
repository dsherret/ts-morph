import * as path from "path";
import * as fs from "fs";
import fastGlob from "fast-glob";
import * as ts from "typescript";
import { createMinifier } from "dts-minify";

const rootDir = path.resolve(__dirname, "../");
const libFilesFilePath = path.join(rootDir, "src/data/libFiles.ts");
const minifier = createMinifier(ts);

fastGlob(`${rootDir.replace(/\\/g, "/")}/node_modules/typescript/lib/lib*.d.ts`).then(filePaths => {
    let libFileText = "// dprint-ignore-file\nexport const libFiles: { fileName: string; text: string; }[] = [";
    for (const filePath of filePaths) {
        const fileText = fs.readFileSync(filePath).toString("utf8");

        if (libFileText.endsWith("}"))
            libFileText += ", ";

        libFileText += `{\n`
            + `    fileName: "${path.basename(filePath)}",\n`
            + `    text: \`${minifier.minify(fileText).replace(/\r?\n/g, "\\n").replace(/`/g, "\\`")}\`\n`
            + `}`;
    }

    libFileText += "];\n";

    fs.writeFileSync(
        libFilesFilePath,
        libFileText,
        { encoding: "utf8" }
    );
});
