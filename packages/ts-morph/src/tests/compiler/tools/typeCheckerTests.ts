import { nameof, SymbolFlags, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CallExpression, NamedNode, Node, SourceFile, TypeChecker } from "../../../compiler";
import { Project } from "../../../Project";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../testHelpers";

describe("TypeChecker", () => {
  describe(nameof<TypeChecker>("getAmbientModules"), () => {
    it("should get the ambient modules when they exist", () => {
      // the @types files are written before the project reads anything. tsgo owns
      // the program, and it is built when the first file is added, so a write that
      // goes straight to the file system afterwards is not seen — where classic
      // TypeScript built its program lazily and would have picked one up.
      const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { types: ["jquery"] } });
      const fileSystem = project.getFileSystem();

      fileSystem.writeFileSync(
        "/node_modules/@types/jquery/index.d.ts",
        `
    declare module 'jquery' {
        export = jQuery;
    }
    declare const jQuery: JQueryStatic;
    interface JQueryStatic {
        test: string;
    }`,
      );
      fileSystem.writeFileSync(
        "/node_modules/@types/jquery/package.json",
        `{ "name": "@types/jquery", "version": "1.0.0", "typeScriptVersion": "2.3" }`,
      );
      project.createSourceFile("/main.ts", "");

      const ambientModules = project.getTypeChecker().getAmbientModules();
      expect(ambientModules.length).to.equal(1);
      expect(ambientModules[0].getName()).to.equal(`"jquery"`);
    });

    it("should not have any when they don't exist", () => {
      const { project } = getInfoFromText("");
      expect(project.getTypeChecker().getAmbientModules().length).to.equal(0);
    });
  });

  describe(nameof<TypeChecker>("getResolvedSignature"), () => {
    function doTest(text: string, declarationName: string | undefined) {
      const { descendant, project } = getInfoFromTextWithDescendant<CallExpression>(text, SyntaxKind.CallExpression);
      const result = project.getTypeChecker().getResolvedSignature(descendant);
      expect((result?.getDeclaration() as NamedNode)?.getName()).to.equal(declarationName);
    }

    it("should not resolve unknown signature", () => {
      doTest("foo();", undefined);
    });

    it("should resolve signature in same file", () => {
      doTest("function foo(){}; foo();", "foo");
    });
  });

  describe(nameof<TypeChecker>("getResolvedSignatureOrThrow"), () => {
    function doTest(text: string, declarationName: string | undefined) {
      const { descendant, project } = getInfoFromTextWithDescendant<CallExpression>(text, SyntaxKind.CallExpression);
      if (declarationName == null)
        expect(() => project.getTypeChecker().getResolvedSignatureOrThrow(descendant)).to.throw();
      else {
        const result = project.getTypeChecker().getResolvedSignatureOrThrow(descendant);
        expect((result.getDeclaration() as NamedNode).getName()).to.equal(declarationName);
      }
    }

    it("should not resolve unknown signature", () => {
      doTest("foo();", undefined);
    });

    it("should resolve signature in same file", () => {
      doTest("function foo(){}; foo();", "foo");
    });
  });

  describe(nameof<TypeChecker>("getSymbolsInScope"), () => {
    function doTest(text: string, selectNode: (sourceFile: SourceFile) => Node, meaning: SymbolFlags, expectedSymbolNames: string[]) {
      const { sourceFile, project } = getInfoFromText(text);
      const node = selectNode(sourceFile);
      const result = project.getTypeChecker().getSymbolsInScope(node, meaning);
      expect(result.map(s => s.getName()).sort()).to.deep.equal(expectedSymbolNames.sort());
    }

    it("should get all the symbols in the provided scope filtered by meaning", () => {
      doTest(
        "function a() { function b() {} const c = ''; function e() { function f() {} } }",
        sourceFile => sourceFile.getFunctionOrThrow("a").getVariableDeclarationOrThrow("c"),
        SymbolFlags.Function,
        ["a", "b", "e"],
      );
    });
  });

  describe(nameof<TypeChecker>("getExportSymbolOfSymbol"), () => {
    it("should get the export symbol of a local symbol", () => {
      const { sourceFile, project } = getInfoFromText("export type T = number;");
      const local = sourceFile.getTypeAliasOrThrow("T").getNameNode().getSymbolsInScope(SymbolFlags.TypeAlias)[0];
      const exportSymbol = project.getTypeChecker().getExportSymbolOfSymbol(local);
      expect(exportSymbol).to.not.equal(local);
      expect(exportSymbol.getName()).to.equal("T");
    });

    it("should return the symbol when it is not a local symbol with an export symbol", () => {
      const { sourceFile, project } = getInfoFromText("type T = number;");
      const local = sourceFile.getTypeAliasOrThrow("T").getNameNode().getSymbolsInScope(SymbolFlags.TypeAlias)[0];
      expect(project.getTypeChecker().getExportSymbolOfSymbol(local)).to.equal(local);
    });
  });
});
