/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the definition file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import * as path from "path";
import Project, {SourceFile, ClassDeclaration, TypeGuards, ts, SyntaxKind} from "../src/main";
import {getDefinitionProject} from "./common";

const project = getDefinitionProject();

const definitionFiles = project.getSourceFiles(["dist/**/*.d.ts", "!dist/typescript/typescript.d.ts"]);
const mainFile = project.getSourceFileOrThrow("main.d.ts");
const compilerApiFile = project.getSourceFileOrThrow("dist/typescript/typescript.d.ts");
const exportedDeclarations = mainFile.getExportedDeclarations();
mainFile.replaceWithText(`import CodeBlockWriter from "code-block-writer";\n`); // clear the source file

for (let declaration of exportedDeclarations) {
    if (declaration.getSourceFile() === compilerApiFile)
        continue;
    if (TypeGuards.isVariableDeclaration(declaration))
        declaration = declaration.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

    mainFile.insertText(mainFile.getFullWidth(), declaration.getFullText() + "\n");
}

// add an import to the typescript compiler api file
mainFile.addImportDeclaration({
    namedImports: ["ts", "SyntaxKind", "CompilerOptions", "EmitHint", "ScriptKind", "NewLineKind", "LanguageVariant", "ScriptTarget",
        "TypeFlags", "ObjectFlags", "SymbolFlags", "TypeFormatFlags", "DiagnosticCategory", "EditorSettings"],
    moduleSpecifier: mainFile.getRelativePathToSourceFileAsModuleSpecifier(compilerApiFile)
});

mainFile.addExportDeclaration({ moduleSpecifier: mainFile.getRelativePathToSourceFileAsModuleSpecifier(compilerApiFile) });

// update the main.d.ts file
mainFile.getClassOrThrow("Project").setIsDefaultExport(true);
mainFile.replaceWithText(mainFile.getFullText().replace(/compiler\.([A-Za-z]+)/g, "$1"));

definitionFiles.filter(f => f !== mainFile).forEach(f => f.delete());

project.save();
