import { SourceFile, TypeGuards, SyntaxKind, Node, StatementStructures, StructureKind, VariableDeclarationKind } from "ts-morph";

export function getDeclarationFileStatements(mainFile: SourceFile) {
    const tsNames: string[] = [];
    const statements: StatementStructures[] = [];

    // add imports the typescript compiler api and code block writer files
    statements.push({
        kind: StructureKind.ImportDeclaration,
        namedImports: ["errors", "ts"],
        moduleSpecifier: "@ts-morph/common"
    });

    for (const [name, declarations] of mainFile.getExportedDeclarations()) {
        for (const declaration of declarations) {
            const sourceFile = declaration.getSourceFile();
            if (sourceFile.isInNodeModules()) {
                const filePath = sourceFile.getFilePath();
                if (filePath.includes("node_modules/typescript/")) {
                    if (name !== "ts")
                        tsNames.push(name);
                    continue;
                }
                else if (filePath.includes("node_modules/code-block-writer/"))
                    continue;
                else if (!filePath.includes("node_modules/@ts-morph/common/"))
                    throw new Error(`Unexpected scenario where source file was from: ${filePath}`);
            }

            if (TypeGuards.isVariableDeclaration(declaration)) {
                statements.push({
                    ...declaration.getVariableStatementOrThrow().getStructure(),
                    declarations: [declaration.getStructure()]
                });
            }
            else if (TypeGuards.isStatement(declaration))
                statements.push((declaration as any).getStructure()); // todo: improve
            else
                throw new Error(`Not handled scenario for ${declaration.getKindName()}`);
        }
    }

    statements.push({
        kind: StructureKind.ImportDeclaration,
        namedImports: tsNames,
        moduleSpecifier: "@ts-morph/common"
    });
    statements.push({
        kind: StructureKind.ExportDeclaration,
        namedExports: ["ts", ...tsNames]
    });

    return statements;
}
