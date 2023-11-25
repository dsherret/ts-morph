import { tsMorph } from "../../deps.ts";

export function getDeclarationFileStatements(mainFile: tsMorph.SourceFile) {
  function hasInternalJsDoc(structure: tsMorph.Structure) {
    return tsMorph.Structure.isJSDocable(structure) && structure.docs && structure.docs.some(d => d.tags && d.tags.some(t => t.tagName === "internal"));
  }

  function stripInternalTags(structure: any) {
    for (const key of Object.keys(structure)) {
      const value = structure[key];
      if (value instanceof Array)
        structure[key] = value.filter((v: any) => !hasInternalJsDoc(v));
    }
    return structure;
  }

  const tsNames: string[] = [];
  const statements: tsMorph.StatementStructures[] = [];

  // add imports the typescript compiler api and code block writer files
  statements.push({
    kind: tsMorph.StructureKind.ImportDeclaration,
    namedImports: ["errors", "StandardizedFilePath", "ts"],
    moduleSpecifier: "@ts-morph/common",
  });

  for (const [name, declarations] of mainFile.getExportedDeclarations()) {
    if (name === "ts")
      continue;

    for (const declaration of declarations) {
      if (tsMorph.Node.isJSDocable(declaration) && declaration.getJsDocs().some(d => d.getTags().some(t => t.getTagName() === "internal")))
        continue;
      const sourceFile = declaration.getSourceFile();
      const filePath = sourceFile.getFilePath();
      if (filePath.includes("common/lib/typescript.d.ts")) {
        if (name !== "ts")
          tsNames.push(name);
        continue;
      } else if (filePath.includes("node_modules/code-block-writer/"))
        continue;
      else if (sourceFile.isInNodeModules() && !filePath.includes("node_modules/@ts-morph/common/"))
        throw new Error(`Unexpected scenario where source file was from: ${filePath}`);

      if (tsMorph.Node.isVariableDeclaration(declaration)) {
        statements.push({
          ...declaration.getVariableStatementOrThrow().getStructure(),
          declarations: [declaration.getStructure()],
        });
      } else if (tsMorph.Node.isStatement(declaration))
        statements.push(stripInternalTags((declaration as any).getStructure())); // todo: improve
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
