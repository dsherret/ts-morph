import { SyntaxKind } from "@ts-morph/common";
import { expect, assert } from "chai";
import { Project } from "../../../Project";

describe("orThrow", () => {
  it("should show the source of the throw", () => {
    const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });
    const sourceFile = project.createSourceFile("test.ts", `
        // Test
        export const foo = 42;
        export const bar = 99;
    `);
    const exportDeclaration = sourceFile.getExportedDeclarations().get("bar")?.[0];
    assert(exportDeclaration);
    expect(() => exportDeclaration.getLastChildByKindOrThrow(SyntaxKind.IfStatement))
      .to.throw(`A child of the kind IfStatement was expected.
 in /test.ts:4:22

> 4 |        export const bar = 99;
    |                     ^`);
  });

  it("should show allow to set a custom error message", () => {
    const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });
    const sourceFile = project.createSourceFile("test.ts", `
        // Test
        export const foo = 42;
        export const bar = 99;
    `);
    const exportDeclaration = sourceFile.getExportedDeclarations().get("bar")?.[0];
    assert(exportDeclaration);
    expect(() => exportDeclaration.getLastChildByKindOrThrow(SyntaxKind.IfStatement, "This is a demo error message."))
      .to.throw(`This is a demo error message.
 in /test.ts:4:22

> 4 |        export const bar = 99;
    |                     ^`);
  });

  it("should show allow to set a function returning a custom error message", () => {
    const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true });
    const sourceFile = project.createSourceFile("test.ts", `
        // Test
        export const foo = 42;
        export const bar = 99;
    `);
    const exportDeclaration = sourceFile.getExportedDeclarations().get("bar")?.[0];
    assert(exportDeclaration);
    expect(() => exportDeclaration.getLastChildByKindOrThrow(SyntaxKind.IfStatement, () => "This is a demo error message."))
      .to.throw(`This is a demo error message.
 in /test.ts:4:22

> 4 |        export const bar = 99;
    |                     ^`);
  });

});
