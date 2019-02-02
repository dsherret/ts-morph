/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import { Project, SourceFile, TypeGuards, SyntaxKind } from "ts-morph";

export function flattenDeclarationFiles(project: Project, mainFile: SourceFile) {
    const declarationFiles = project.getSourceFiles(["dist-declarations/**/*.d.ts", "!dist-declarations/codeBlockWriter/code-block-writer.d.ts"]);
    const codeBlockWriterFile = project.getSourceFileOrThrow("dist-declarations/codeBlockWriter/code-block-writer.d.ts");
    const exportedDeclarations = mainFile.getExportedDeclarations()
        .filter(d => d.getKind() !== SyntaxKind.NamespaceImport); // ignore ts namespace export (todo: make this more specific)
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
    // todo: no JSDoc? seems like TypeScript declaration file says no, but the compiler parses it anyway
    const defaultExport = mainFile.addExportAssignment({ expression: "Project", isExportEquals: false });
    mainFile.insertText(defaultExport.getStart(), writer => writer.write(`/** @deprecated Use the named export "Project" */`).newLine());
    mainFile.replaceWithText(mainFile.getFullText().replace(/compiler\.([A-Za-z]+)/g, "$1").replace(/ts\.(SyntaxKind)/g, "$1"));

    declarationFiles.filter(f => f !== mainFile).forEach(f => f.delete());
}
