/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import { Project, SourceFile, TypeGuards, SyntaxKind } from "ts-simple-ast";

export function flattenDeclarationFiles(project: Project, mainFile: SourceFile) {
    const declarationFiles = project.getSourceFiles(["dist/**/*.d.ts", "!dist/codeBlockWriter/code-block-writer.d.ts"]);
    const codeBlockWriterFile = project.getSourceFileOrThrow("dist/codeBlockWriter/code-block-writer.d.ts");
    const exportedDeclarations = mainFile.getExportedDeclarations().filter(d => d.getSourceFile() !== mainFile);
    const flattenedCompilerApiExports = [
        "SyntaxKind", "CompilerOptions", "EmitHint", "ScriptKind", "NewLineKind", "LanguageVariant", "ScriptTarget",
        "TypeFlags", "ObjectFlags", "SymbolFlags", "TypeFormatFlags", "DiagnosticCategory", "EditorSettings",
        "ModuleResolutionKind"
    ];

    mainFile.removeText();

    for (let declaration of exportedDeclarations) {
        const sourceFile = declaration.getSourceFile();
        if (sourceFile === codeBlockWriterFile || sourceFile.getBaseName() === "typescript.d.ts")
            continue;
        if (TypeGuards.isVariableDeclaration(declaration))
            declaration = declaration.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

        mainFile.insertText(mainFile.getFullWidth(), declaration.getFullText() + "\n");
    }

    // add imports the typescript compiler api and code block writer files
    mainFile.addImportDeclaration({
        namespaceImport: "ts",
        moduleSpecifier: "typescript"
    });
    mainFile.addImportDeclaration({
        namedImports: flattenedCompilerApiExports,
        moduleSpecifier: "typescript"
    });
    mainFile.addImportDeclaration({
        namedImports: ["CodeBlockWriter"],
        moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(codeBlockWriterFile)
    });

    mainFile.addExportDeclaration({ namedExports: ["ts", ...flattenedCompilerApiExports] });
    mainFile.addExportDeclaration({ moduleSpecifier: mainFile.getRelativePathAsModuleSpecifierTo(codeBlockWriterFile) });
    // todo: no JSDoc? seems like TypeScript declaration file says no, but the compiler parses it anyway
    const defaultExport = mainFile.addExportAssignment({ expression: "Project", isExportEquals: false });
    mainFile.insertText(defaultExport.getStart(), writer => writer.write(`/** @deprecated Use the named export "Project" */`).newLine());

    // update the main.d.ts file
    mainFile.replaceWithText(mainFile.getFullText().replace(/compiler\.([A-Za-z]+)/g, "$1").replace(/ts\.(SyntaxKind)/g, "$1"));

    declarationFiles.filter(f => f !== mainFile).forEach(f => f.delete());
}
