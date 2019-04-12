/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import { Project, SourceFile, TypeGuards, SyntaxKind, Node } from "ts-morph";
import { ArrayUtils } from "../../src/utils";

export function flattenDeclarationFiles(project: Project, mainFile: SourceFile) {
    const declarationFiles = project.getSourceFiles(["dist-declarations/**/*.d.ts", "!dist-declarations/codeBlockWriter/code-block-writer.d.ts"]);
    const codeBlockWriterFile = project.getSourceFileOrThrow("dist-declarations/codeBlockWriter/code-block-writer.d.ts");
    const exportedDeclarations = ArrayUtils.flatten(Array.from(mainFile.getExportedDeclarations()
        .entries())
        .filter(entry => entry[0] !== "ts") // ignore ts namespace export
        .map(entry => entry[1])) as Node[];
    const flattenedCompilerApiExports = [
        "SyntaxKind", "CompilerOptions", "EmitHint", "ScriptKind", "NewLineKind", "LanguageVariant", "ScriptTarget",
        "TypeFlags", "ObjectFlags", "SymbolFlags", "TypeFormatFlags", "DiagnosticCategory", "EditorSettings",
        "ModuleResolutionKind"
    ];

    codeBlockWriterFile.moveToDirectory(project.getDirectoryOrThrow("dist-declarations"));

    let text = "";
    for (let declaration of exportedDeclarations) {
        const sourceFile = declaration.getSourceFile();
        if (sourceFile === codeBlockWriterFile || sourceFile.getBaseName() === "typescript.d.ts")
            continue;
        if (TypeGuards.isVariableDeclaration(declaration))
            declaration = declaration.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

        text += declaration.getFullText() + "\n";
    }

    mainFile.replaceWithText(text);

    // add imports the typescript compiler api and code block writer files
    mainFile.addImportDeclarations([{
        namespaceImport: "ts",
        moduleSpecifier: "typescript"
    }, {
        namedImports: flattenedCompilerApiExports,
        moduleSpecifier: "typescript"
    }, {
        namedImports: ["CodeBlockWriter"],
        moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(codeBlockWriterFile)
    }]);

    mainFile.addExportDeclarations([
        { namedExports: ["ts", ...flattenedCompilerApiExports] },
        { moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(codeBlockWriterFile) }
    ]);

    mainFile.replaceWithText(mainFile.getFullText().replace(/compiler\.([A-Za-z]+)/g, "$1").replace(/ts\.(SyntaxKind)/g, "$1"));

    declarationFiles.filter(f => f !== mainFile).forEach(f => f.delete());
}
