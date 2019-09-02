import { SourceFile, TypeGuards, SyntaxKind, Node, StatementStructures, StructureKind } from "ts-morph";
import { ArrayUtils } from "../../../src/utils";

export function getDeclarationFileStatements(mainFile: SourceFile) {
    const exportedDeclarations = ArrayUtils.flatten(Array.from(mainFile.getExportedDeclarations()
        .entries())
        .filter(entry => entry[0] !== "ts") // ignore ts namespace export
        .map(entry => entry[1])) as Node[];
    const flattenedCompilerApiExports = [
        "SyntaxKind",
        "CompilerOptions",
        "EmitHint",
        "ScriptKind",
        "NewLineKind",
        "LanguageVariant",
        "ScriptTarget",
        "TypeFlags",
        "ObjectFlags",
        "SymbolFlags",
        "TypeFormatFlags",
        "DiagnosticCategory",
        "EditorSettings",
        "ModuleResolutionKind"
    ];
    const statements: StatementStructures[] = [];

    // add imports the typescript compiler api and code block writer files
    // todo: couldn't use statements.push(...[items]); here for some reason...
    statements.push({
        kind: StructureKind.ImportDeclaration,
        namespaceImport: "ts",
        moduleSpecifier: "typescript"
    });
    statements.push({
        kind: StructureKind.ImportDeclaration,
        namedImports: flattenedCompilerApiExports,
        moduleSpecifier: "typescript"
    });

    for (let declaration of exportedDeclarations) {
        const sourceFile = declaration.getSourceFile();
        if (sourceFile.getBaseName() === "code-block-writer.d.ts" || sourceFile.getBaseName() === "typescript.d.ts")
            continue;
        if (TypeGuards.isVariableDeclaration(declaration))
            declaration = declaration.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

        if (TypeGuards.isStatement(declaration))
            statements.push((declaration as any).getStructure()); // todo: improve
        else
            throw new Error(`Not handled scenario for ${declaration.getKindName()}`);
    }

    statements.push({ kind: StructureKind.ExportDeclaration, namedExports: ["ts", ...flattenedCompilerApiExports] });

    return statements;
}
