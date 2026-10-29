import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { Node, SyntaxList } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("SyntaxList", () => {
  describe(nameof<SyntaxList>("insertChildText"), () => {
    // most of these tests are in StatementedNode
    it("should insert a class member", () => {
      const { sourceFile, firstChild } = getInfoFromText("class MyClass {\n}\n");
      firstChild.getChildSyntaxListOrThrow().insertChildText(0, writer => {
        writer.write("get myNumber()").block(() => {
          writer.writeLine("return 5;");
        });
      });
      expect(sourceFile.getFullText()).to.equal("class MyClass {\n    get myNumber() {\n        return 5;\n    }\n}\n");
    });

    it("should insert inline at the start", () => {
      const { sourceFile, firstChild } = getInfoFromText(`abstract class MyClass {}`);
      const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
      syntaxList.insertChildText(0, "export");

      expect(sourceFile.getFullText()).to.equal(`export abstract class MyClass {}`);
    });

    it("should insert inline in the middle", () => {
      const { sourceFile, firstChild } = getInfoFromText(`export declare class MyClass {}`);
      const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
      syntaxList.insertChildText(1, "abstract");

      expect(sourceFile.getFullText()).to.equal(`export abstract declare class MyClass {}`);
    });

    it("should insert inline at the end", () => {
      const { sourceFile, firstChild } = getInfoFromText(`export class MyClass {}`);
      const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
      syntaxList.insertChildText(1, "abstract");

      expect(sourceFile.getFullText()).to.equal(`export abstract class MyClass {}`);
    });

    it("should indent on next line in case someone adds a newline", () => {
      const { sourceFile, firstChild } = getInfoFromText(`export class MyClass {}`);
      const syntaxList = firstChild.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
      syntaxList.insertChildText(1, "\nabstract");

      expect(sourceFile.getFullText()).to.equal(`export \n    abstract class MyClass {}`);
    });

    describe("union types", () => {
      function doTest(text: string, index: number, insertText: string, expectedText: string, expectedNodes: string[]) {
        const { sourceFile } = getInfoFromText(text);
        const unionType = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.UnionType);
        const syntaxList = unionType.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
        const insertedNodes = syntaxList.insertChildText(index, writer => writer.write(insertText));
        expect(sourceFile.getFullText()).to.equal(expectedText);
        expect(insertedNodes.map(node => node.getText())).to.deep.equal(expectedNodes);
      }

      it("should insert inline at the start", () => {
        doTest("type T = string | number;", 0, "null |", "type T = null | string | number;", ["null", "|"]);
      });

      it("should insert inline in the middle", () => {
        doTest("type T = string | number;", 2, "boolean |", "type T = string | boolean | number;", ["boolean", "|"]);
      });

      it("should insert inline at the end", () => {
        doTest("type T = string | number;", 3, "| undefined", "type T = string | number | undefined;", ["|", "undefined"]);
      });

      it("should insert inline before a leading pipe", () => {
        doTest("type T = | string | number;", 0, "| null", "type T = | null | string | number;", ["|", "null"]);
      });

      it("should not change the text when inserting empty text", () => {
        doTest("type T = string | number;", 0, "", "type T = string | number;", []);
      });
    });
  });

  describe(nameof<SyntaxList>("addChildText"), () => {
    function doSourceFileTest(code: string, statements: string, expectedLength: number, expectedCode: string) {
      const { sourceFile } = getInfoFromText(code);
      const nodes = sourceFile.getChildSyntaxListOrThrow().addChildText(statements);
      expect(nodes.length).to.equal(expectedLength);
      expect(nodes[0]).to.be.instanceOf(Node);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
    }

    it("should add the children at the end of a source file", () => {
      doSourceFileTest(
        "function a() {}\nfunction b() {}",
        "newText;\nsecondText;",
        2,
        "function a() {}\nfunction b() {}\nnewText;\nsecondText;",
      );
    });
  });
});
