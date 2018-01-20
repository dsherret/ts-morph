/*
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the definition file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import * as path from "path";
import * as ts from "typescript";
import TsSimpleAst, {SourceFile, ClassDeclaration, TypeGuards} from "./../src/main";
import {getDefinitionAst} from "./common";

const ast = getDefinitionAst();

const definitionFiles = ast.getSourceFiles("**/dist/**/*.d.ts");
const mainFile = ast.getSourceFileOrThrow("main.d.ts");
const exportedDeclarations = mainFile.getExportedDeclarations();
mainFile.replaceWithText(`import * as ts from "typescript";\nimport CodeBlockWriter from "code-block-writer";\n`); // clear the source file

for (let declaration of exportedDeclarations) {
    if (TypeGuards.isVariableDeclaration(declaration))
        declaration = declaration.getFirstAncestorByKindOrThrow(ts.SyntaxKind.VariableStatement);

    mainFile.insertText(mainFile.getFullWidth(), declaration.getFullText() + "\n");
}

mainFile.getClassOrThrow("TsSimpleAst").setIsDefaultExport(true);
mainFile.replaceWithText(mainFile.getFullText().replace(/compiler\.([A-Za-z]+)/g, "$1"));
mainFile.save();

definitionFiles.filter(f => f !== mainFile).forEach(f => f.delete());
