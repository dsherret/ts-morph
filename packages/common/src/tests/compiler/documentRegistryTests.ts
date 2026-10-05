import { expect } from "chai";
import { DocumentRegistry } from "../../compiler";
import { InMemoryFileSystemHost, TransactionalFileSystem } from "../../fileSystem";
import { ts } from "../../typescript";

describe("DocumentRegistry", () => {
  function setup() {
    const fileSystem = new TransactionalFileSystem({
      fileSystem: new InMemoryFileSystemHost(),
      libFolderPath: undefined,
      skipLoadingLibFiles: false,
    });
    return { fileSystem, registry: new DocumentRegistry(fileSystem), nativeRegistry: ts.createDocumentRegistry() };
  }

  const testCases = [
    { name: "forced module", fileName: "/file.ts", text: "const value = 1;", mode: ts.ModuleDetectionKind.Force, expectedModule: true },
    { name: "declaration-file global", fileName: "/file.d.ts", text: "interface Global {}", mode: ts.ModuleDetectionKind.Force, expectedModule: false },
    { name: "legacy script", fileName: "/file.ts", text: "const value = 1;", mode: ts.ModuleDetectionKind.Legacy, expectedModule: false },
    { name: "explicit legacy module", fileName: "/file.ts", text: "export const value = 1;", mode: ts.ModuleDetectionKind.Legacy, expectedModule: true },
  ];
  for (const testCase of testCases) {
    it(`should classify a ${testCase.name} like the native registry and preserve the default target`, () => {
      const { fileSystem, registry, nativeRegistry } = setup();
      const fileName = fileSystem.getStandardizedAbsolutePath(testCase.fileName);
      const options = { moduleDetection: testCase.mode };
      const snapshot = ts.ScriptSnapshot.fromString(testCase.text);
      const actual = registry.createOrUpdateSourceFile(fileName, options, snapshot, ts.ScriptKind.TS);
      const expected = nativeRegistry.acquireDocument(fileName, options, snapshot, "0", ts.ScriptKind.TS);

      expect(ts.isExternalModule(expected)).to.equal(testCase.expectedModule);
      expect(ts.isExternalModule(actual)).to.equal(ts.isExternalModule(expected));
      expect(actual.languageVersion).to.equal(ts.ScriptTarget.Latest);
      expect(registry.getSourceFileVersion(actual)).to.equal("0");
    });
  }

  it("should preserve an explicit target and script kind when creating a forced module", () => {
    const { fileSystem, registry } = setup();
    const fileName = fileSystem.getStandardizedAbsolutePath("/file.txt");
    const options = { target: ts.ScriptTarget.ES2015, moduleDetection: ts.ModuleDetectionKind.Force };
    const snapshot = ts.ScriptSnapshot.fromString("const element = <div />;");
    const sourceFile = registry.createOrUpdateSourceFile(fileName, options, snapshot, ts.ScriptKind.TSX);
    const statement = sourceFile.statements[0] as ts.VariableStatement;

    expect(ts.isExternalModule(sourceFile)).to.equal(true);
    expect(sourceFile.languageVersion).to.equal(ts.ScriptTarget.ES2015);
    expect(statement.declarationList.declarations[0].initializer!.kind).to.equal(ts.SyntaxKind.JsxSelfClosingElement);
  });

  it("should apply changed compilation settings when updating an acquired document", () => {
    const { registry, nativeRegistry } = setup();
    const snapshot = ts.ScriptSnapshot.fromString("const value = 1;");
    const legacy = { moduleDetection: ts.ModuleDetectionKind.Legacy };
    registry.acquireDocument("/file.ts", legacy, snapshot, "0", ts.ScriptKind.TS);
    nativeRegistry.acquireDocument("/file.ts", legacy, snapshot, "0", ts.ScriptKind.TS);
    const force = { moduleDetection: ts.ModuleDetectionKind.Force };
    const actual = registry.updateDocument("/file.ts", force, snapshot, "1", ts.ScriptKind.TS);
    const expected = nativeRegistry.updateDocument("/file.ts", force, snapshot, "1", ts.ScriptKind.TS);

    expect(ts.isExternalModule(expected)).to.equal(true);
    expect(ts.isExternalModule(actual)).to.equal(ts.isExternalModule(expected));
    expect(registry.getSourceFileVersion(actual)).to.equal("1");
  });

  it("should preserve forced classification through keyed acquisition and text updates", () => {
    const { registry } = setup();
    const options = { moduleDetection: ts.ModuleDetectionKind.Force };
    const fileName = "/file.ts";
    const filePath = fileName as ts.Path;
    const key = registry.getKeyForCompilationSettings(options);
    registry.acquireDocumentWithKey(fileName, filePath, options, key, ts.ScriptSnapshot.fromString("export const value = 1;"), "0", ts.ScriptKind.TS);
    const text = "const value = 2;";
    const actual = registry.updateDocumentWithKey(fileName, filePath, options, key, ts.ScriptSnapshot.fromString(text), "1", ts.ScriptKind.TS);

    expect(ts.isExternalModule(actual)).to.equal(true);
    expect(actual.text).to.equal(text);
    expect(registry.getSourceFileVersion(actual)).to.equal("1");
  });
});
