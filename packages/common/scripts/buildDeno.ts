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
commonFile.getClassOrThrow("NodeRuntimeFileSystem").remove();
commonFile.getClassOrThrow("NodeRuntimePath").remove();
commonFile.getClassOrThrow("BrowserRuntime").remove();
commonFile.getClassOrThrow("BrowserRuntimeFileSystem").remove();
commonFile.getClassOrThrow("BrowserRuntimePath").remove();
commonFile.getFunctionOrThrow("isNodeJs").remove();
commonFile.getImportDeclarationOrThrow("path").remove();
commonFile.getImportDeclarationOrThrow("minimatch").remove();
commonFile.getImportDeclarationOrThrow("fast-glob").remove();
commonFile.getImportDeclarationOrThrow("mkdirp").remove();
commonFile.getImportDeclarationOrThrow("os").remove();
commonFile.getImportDeclarationOrThrow("fs").remove();
commonFile.getVariableDeclarationOrThrow("path$1").remove();

const runtimeFileDestinationPath = `${folderPath}/DenoRuntime.ts`;
const runtimeFullText = fileSystem.readFileSync("./src/runtimes/DenoRuntime.ts");
fileSystem.writeFileSync(runtimeFileDestinationPath, runtimeFullText.replace(/\/\/ @ts\-ignore(\s|(\r?\n))*/g, ""));
const runtimeSourceFile = project.addSourceFileAtPath(runtimeFileDestinationPath);
runtimeSourceFile.getVariableDeclarationOrThrow("Deno").remove();
runtimeSourceFile.saveSync();

// setup the deno runtime
commonFile.getFunctionOrThrow("getRuntime").setBodyText("return new DenoRuntime();");
commonFile.saveSync();

const copyDirPath = "../../deno/common/";
fileSystem.mkdirSync(copyDirPath);
fileSystem.mkdirSync(`${copyDirPath}/data`);
fileSystem.copySync(`${folderPath}/ts-morph-common.js`, `${copyDirPath}/ts_morph_common.js`);
fileSystem.copySync(`${folderPath}/DenoRuntime.ts`, `${copyDirPath}/DenoRuntime.ts`);
fileSystem.copySync(`${folderPath}/data/libFiles.js`, `${copyDirPath}/data/libFiles.js`);

const typeScriptSourceFile = fileSystem.readFileSync("node_modules/typescript/lib/typescript.js");
fileSystem.writeFileSync(`${copyDirPath}/typescript.js`, typeScriptSourceFile + "\nexport { ts };\n");
fileSystem.copySync("node_modules/typescript/lib/typescript.d.ts", `${copyDirPath}/typescript.d.ts`);
fileSystem.copySync(`./lib/ts-morph-common.d.ts`, `${copyDirPath}/ts_morph_common.d.ts`);
fileSystem.writeFileSync(`${copyDirPath}/mod.ts`, `// @deno-types="./ts_morph_common.d.ts"\nexport * from "./ts_morph_common.js";\n`);

const finalDeclFile = project.addSourceFileAtPath(`${copyDirPath}/ts_morph_common.d.ts`);
updateOnlyModuleSpecifiers(finalDeclFile);
finalDeclFile.saveSync();

function updateTypeScriptImportsExports(file: tsMorph.SourceFile) {
    const localNames = new Set<string>();
    for (const statement of file.getStatements()) {
        if (!Node.isExportDeclaration(statement) && !Node.isImportDeclaration(statement))
            continue;
        const moduleSpecifierValue = statement.getModuleSpecifierValue();
        if (moduleSpecifierValue === "typescript" || moduleSpecifierValue === "./typescript") {
            statement.setModuleSpecifier("./typescript.js");

            // support ES modules
            if (Node.isImportDeclaration(statement)) {
                if (statement.getNamespaceImport() != null) {
                    // move this to the top
                    file.insertStatements(0, `// @deno-types="./typescript.d.ts"\nimport { ts } from "./typescript.js";`);
                    statement.remove();
                    continue;
                }

                // inline the named imports
                const namedImports = statement.getNamedImports();
                // replace the named imports with variable declarations
                file.insertStatements(statement.getChildIndex(), writer => {
                    for (const namedImport of namedImports) {
                        writeImportAsVarStmt(writer, {
                            localName: namedImport.getAliasNode()?.getText() ?? namedImport.getName(),
                            name: namedImport.getName(),
                        });
                    }
                });
                statement.remove();
            }
            else {
                // make the export declaration have some leading variable declarations, then remove the module specifier
                const namedExports = statement.getNamedExports();
                file.insertStatements(statement.getChildIndex(), writer => {
                    for (const namedExport of namedExports) {
                        writeImportAsVarStmt(writer, {
                            localName: namedExport.getName(),
                            name: namedExport.getName(),
                        });
                    }
                });
                statement.removeModuleSpecifier();
            }
        }
    }

    function writeImportAsVarStmt(writer: tsMorph.CodeBlockWriter, importDecl: { localName: string; name: string; }) {
        if (localNames.has(importDecl.localName))
            return;

        localNames.add(importDecl.localName);
        writer.writeLine(`const ${importDecl.localName} = ts.${importDecl.name};`);
    }
}

function updateOnlyModuleSpecifiers(file: tsMorph.SourceFile) {
    for (const statement of file.getStatements()) {
        if (!Node.isExportDeclaration(statement) && !Node.isImportDeclaration(statement))
            continue;
        const moduleSpecifierValue = statement.getModuleSpecifierValue();
        if (moduleSpecifierValue === "typescript" || moduleSpecifierValue === "./typescript") {
            statement.setModuleSpecifier("./typescript.js");
            file.insertStatements(statement.getChildIndex(), `// @deno-types="./typescript.d.ts"`);
        }
    }
}
