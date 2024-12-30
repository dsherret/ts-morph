import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { AsyncableNode, FunctionDeclaration, Node, VariableStatement } from "../../../../compiler";
import { AsyncableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe("AsyncableNode", () => {
  describe("navigation", () => {
    const { sourceFile: mainSourceFile } = getInfoFromText("async function Identifier() {}\nfunction Identifier2() {}");
    const asyncFunc = mainSourceFile.getFunctions()[0];
    const nonAsyncFunc = mainSourceFile.getFunctions()[1];

    describe(nameof<AsyncableNode>("isAsync"), () => {
      it("should be async when async", () => {
        expect(asyncFunc.isAsync()).to.be.true;
      });

      it("should not be async when not async", () => {
        expect(nonAsyncFunc.isAsync()).to.be.false;
      });
    });

    describe(nameof<AsyncableNode>("getAsyncKeyword"), () => {
      it("should have a async keyword when async", () => {
        expect(asyncFunc.getAsyncKeyword()!.getText()).to.equal("async");
      });

      it("should not have a async keyword when not async", () => {
        expect(nonAsyncFunc.getAsyncKeyword()).to.be.undefined;
      });
    });

    describe(nameof<AsyncableNode>("getAsyncKeywordOrThrow"), () => {
      it("should have a async keyword when async", () => {
        expect(asyncFunc.getAsyncKeywordOrThrow().getText()).to.equal("async");
      });

      it("should not have a async keyword when not async", () => {
        expect(() => nonAsyncFunc.getAsyncKeywordOrThrow()).to.throw();
      });
    });
  });

  describe(nameof<AsyncableNode>("setIsAsync"), () => {
    function doTest(text: string, value: boolean, expected: string) {
      let { firstChild, sourceFile } = getInfoFromText(text);
      if (firstChild.getKind() === SyntaxKind.VariableStatement)
        firstChild = (firstChild as VariableStatement).getDeclarations()[0].getInitializerOrThrow();
      (firstChild as any as AsyncableNode).setIsAsync(value);
      expect(sourceFile.getText()).to.equal(expected);
    }

    it("should set as async when not async", () => {
      doTest("function Identifier() {}", true, "async function Identifier() {}");
    });

    it("should set as not async when async", () => {
      doTest("async function Identifier() {}", false, "function Identifier() {}");
    });

    it("should handle arrow function", () => {
      doTest("const f = a => a * 2;", true, "const f = async a => a * 2;");
      doTest("const f = async a => a * 2;", true, "const f = async a => a * 2;");
      doTest("const f = async a => a * 2;", false, "const f = a => a * 2;");
    });
  });

  describe(nameof<FunctionDeclaration>("getStructure"), () => {
    function doTest(startingCode: string, isAsync: boolean) {
      const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startingCode);
      expect(firstChild.getStructure().isAsync).to.equal(isAsync);
    }

    it("should get when is async", () => {
      doTest("async function test();", true);
    });

    it("should get when is not async", () => {
      doTest("function test();", false);
    });
  });

  describe(nameof<FunctionDeclaration>("set"), () => {
    function doTest(startCode: string, structure: AsyncableNodeStructure, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
      firstChild.set(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
    }

    it("should modify when false and setting true", () => {
      doTest("function myFunction() {}", { isAsync: true }, "async function myFunction() {}");
    });

    it("should modify when true and setting false", () => {
      doTest("async function myFunction() {}", { isAsync: false }, "function myFunction() {}");
    });

    it("should not modify when false and setting false", () => {
      doTest("function myFunction() {}", { isAsync: false }, "function myFunction() {}");
    });

    it("should not modify when true and setting true", () => {
      doTest("async function myFunction() {}", { isAsync: true }, "async function myFunction() {}");
    });

    it("should not modify when false and no property provided", () => {
      doTest("function myFunction() {}", {}, "function myFunction() {}");
    });

    it("should not modify when true and no property provided", () => {
      doTest("async function myFunction() {}", {}, "async function myFunction() {}");
    });
  });
});
