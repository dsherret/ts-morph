import { tsMorph } from "@ts-morph/scripts";

export function getDeclarationFileStatements(mainFile: tsMorph.SourceFile) {
    const tsNames: string[] = [];
    const statements: tsMorph.StatementStructures[] = [];

    // add imports the typescript compiler api and code block writer files
    statements.push({
        kind: tsMorph.StructureKind.ImportDeclaration,
        namedImports: ["errors", "ts", "StandardizedFilePath"],
        moduleSpecifier: "@ts-morph/common",
    });

    for (const [name, declarations] of mainFile.getExportedDeclarations()) {
        if (name === "ts")
            continue;

        for (const declaration of declarations) {
            const sourceFile = declaration.getSourceFile();
            const filePath = sourceFile.getFilePath();
            if (filePath.includes("common/lib/typescript.d.ts")) {
                if (name !== "ts")
                    tsNames.push(name);
                continue;
            }
            else if (filePath.includes("node_modules/code-block-writer/"))
                continue;
            else if (sourceFile.isInNodeModules() && !filePath.includes("node_modules/@ts-morph/common/"))
                throw new Error(`Unexpected scenario where source file was from: ${filePath}`);

            if (tsMorph.Node.isVariableDeclaration(declaration)) {
                statements.push({
                    ...declaration.getVariableStatementOrThrow().getStructure(),
                    declarations: [declaration.getStructure()],
                });
            }
            else if (tsMorph.Node.isStatement(declaration))
                statements.push((declaration as any).getStructure()); // todo: improve
            else
                throw new Error(`Not handled scenario for ${declaration.getKindName()}`);
        }
    }

    statements.push({
        kind: tsMorph.StructureKind.ImportDeclaration,
        namedImports: tsNames,
        moduleSpecifier: "@ts-morph/common",
    });
    statements.push({
        kind: tsMorph.StructureKind.ExportDeclaration,
        namedExports: ["ts", ...tsNames],
    });

    return statements;
}
