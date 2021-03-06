import { tsMorph } from "@ts-morph/scripts";
const { Node, Project } = tsMorph;

const project = new Project();
const fileSystem = project.getFileSystem();
const destPath = "../../deno";
const codeBlockWriterVersion = getCodeBlockWriterVersion();

fileSystem.mkdirSync(destPath);
fileSystem.copySync("./dist-deno/ts-morph.js", `${destPath}/ts-morph.js`);
fileSystem.copySync("./lib/ts-morph.d.ts", `${destPath}/ts-morph.d.ts`);
fileSystem.writeFileSync(`${destPath}/mod.ts`, `/// <deno-types path="./ts-morph.d.ts" />\nexport * from "./ts-morph.js";\n`);

updateImportsExports(project.addSourceFileAtPath(`${destPath}/ts-morph.js`)).saveSync();
updateImportsExports(project.addSourceFileAtPath(`${destPath}/ts-morph.d.ts`)).saveSync();

function updateImportsExports(file: tsMorph.SourceFile) {
    for (const statement of file.getStatements()) {
        if (!Node.isExportDeclaration(statement) && !Node.isImportDeclaration(statement))
            continue;
        const moduleSpecifierValue = statement.getModuleSpecifierValue();
        if (moduleSpecifierValue === "@ts-morph/common")
            statement.setModuleSpecifier("./common/mod.ts");
        else if (moduleSpecifierValue === "code-block-writer")
            statement.setModuleSpecifier(`https://deno.land/x/code_block_writer@${codeBlockWriterVersion}/mod.ts`);
    }
    return file;
}

function getCodeBlockWriterVersion() {
    const packageJson = JSON.parse(fileSystem.readFileSync("./package.json"));
    return packageJson.dependencies["code-block-writer"].replace("^", "");
}
