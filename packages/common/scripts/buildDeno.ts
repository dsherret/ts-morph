import { tsMorph } from "@ts-morph/scripts";
const { Node, Project } = tsMorph;

const project = new Project();
const folderPath = "./dist-deno";
const fileSystem = project.getFileSystem();

const commonFile = project.addSourceFileAtPath(`${folderPath}/ts-morph-common.js`);

updateTypeScriptImportsExports(commonFile);

// make the lib file import an ES import
commonFile.insertImportDeclarations(0, [{
    moduleSpecifier: "./data/libFiles.js",
    namedImports: ["libFiles"],
}, {
    moduleSpecifier: "./DenoRuntime.ts",
    namedImports: ["DenoRuntime"],
}]);
commonFile.getFunctionOrThrow("getLibFiles").setBodyText("return libFiles;");
commonFile.getClassOrThrow("NodeRuntime").remove();
commonFile.getClassOrThrow("NodeRuntimePath").remove();
commonFile.getClassOrThrow("NodeRuntimeFileSystem").remove();

const runtimeFileDestinationPath = `${folderPath}/DenoRuntime.ts`;
const runtimeFullText = fileSystem.readFileSync("./src/runtimes/DenoRuntime.ts");
fileSystem.writeFileSync(runtimeFileDestinationPath, runtimeFullText.replace(/\/\/ @ts\-ignore(\w|\n)*/g, ""));
const runtimeSourceFile = project.addSourceFileAtPath(runtimeFileDestinationPath);
runtimeSourceFile.getVariableDeclarationOrThrow("Deno").remove();
runtimeSourceFile.saveSync();

// setup the deno runtime
commonFile.getFunctionOrThrow("getRuntime").setBodyText("return new DenoRuntime();");
commonFile.saveSync();

const copyDirPath = "../../deno/common/";
fileSystem.mkdirSync(copyDirPath);
fileSystem.mkdirSync(`${copyDirPath}/data`);
fileSystem.copySync(`${folderPath}/ts-morph-common.js`, `${copyDirPath}/ts-morph-common.js`);
fileSystem.copySync(`${folderPath}/DenoRuntime.ts`, `${copyDirPath}/DenoRuntime.ts`);
fileSystem.copySync(`${folderPath}/data/libFiles.js`, `${copyDirPath}/data/libFiles.js`);

const typeScriptSourceFile = fileSystem.readFileSync("node_modules/typescript/lib/typescript.js");
fileSystem.writeFileSync(`${copyDirPath}/typescript.js`, typeScriptSourceFile + "\nexport { ts };\n");
fileSystem.copySync("node_modules/typescript/lib/typescript.d.ts", `${copyDirPath}/typescript.d.ts`);
fileSystem.copySync(`./lib/ts-morph-common.d.ts`, `${copyDirPath}/ts-morph-common.d.ts`);
fileSystem.writeFileSync(`${copyDirPath}/mod.ts`, `/// <deno-types path="./ts-morph-common.d.ts" />\nexport * from "./ts-morph-common.js";\n`);

const finalDeclFile = project.addSourceFileAtPath(`${copyDirPath}/ts-morph-common.d.ts`);
updateTypeScriptImportsExports(finalDeclFile);
finalDeclFile.saveSync();

function updateTypeScriptImportsExports(file: tsMorph.SourceFile) {
    const importedNames = new Set<string>();
    for (const statement of file.getStatements()) {
        if (!Node.isExportDeclaration(statement) && !Node.isImportDeclaration(statement))
            continue;
        const moduleSpecifierValue = statement.getModuleSpecifierValue();
        if (moduleSpecifierValue === "typescript" || moduleSpecifierValue === "./typescript") {
            statement.setModuleSpecifier("./typescript.js");

            if (Node.isImportDeclaration(statement)) {
                if (statement.getNamespaceImport() != null) {
                    // move this to the top
                    file.insertStatements(0, `/// <deno-types path="./typescript.d.ts" />\nimport { ts } from "./typescript.js";`);
                    statement.remove();
                    continue;
                }

                const namedImports = statement.getNamedImports();
                if (namedImports.length > 0) {
                    // replace the named imports with variable declarations
                    file.insertStatements(statement.getChildIndex(), writer => {
                        for (const namedImport of namedImports) {
                            const importedName = namedImport.getAliasNode()?.getText() ?? namedImport.getName();
                            if (!importedNames.has(importedName)) {
                                importedNames.add(importedName);
                                writer.writeLine(`const ${importedName} = ts.${namedImport.getName()};`);
                            }
                        }
                    });
                    statement.remove();
                }
                else {
                    file.insertStatements(statement.getChildIndex(), `/// <deno-types path="./typescript.d.ts" />`);
                }
            }
            else {
                const namedExports = statement.getNamedExports();
                file.insertStatements(statement.getChildIndex(), writer => {
                    for (const namedExport of namedExports) {
                        const importedName = namedExport.getName();
                        if (!importedNames.has(importedName)) {
                            importedNames.add(importedName);
                            writer.writeLine(`const ${importedName} = ts.${namedExport.getName()};`);
                        }
                    }
                });
                statement.removeModuleSpecifier();
            }
        }
    }
}
