import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { BodiedNode, ModuleDeclaration } from "../../../../compiler";
import { WriterFunction } from "../../../../types";
import { getInfoFromText } from "../../testHelpers";

describe("BodiedNode", () => {
  describe(nameof<BodiedNode>("setBodyText"), () => {
    function doTest(startCode: string, newText: string, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<ModuleDeclaration>(startCode);
      firstChild.setBodyText(newText);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
    }

    function doWriterTest(startCode: string, writerFunc: WriterFunction, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<ModuleDeclaration>(startCode);
      firstChild.setBodyText(writerFunc);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
    }

    // most of these tests are in bodyableNodeTests
    it("should set the body text", () => {
      doTest("namespace identifier {}", "var myVar;", "namespace identifier {\n    var myVar;\n}");
    });

    it("should set the body text when using a writer", () => {
      doWriterTest("namespace identifier {}", writer => writer.writeLine("test;").write("asdf;"), "namespace identifier {\n    test;\n    asdf;\n}");
    });
  });

  describe(nameof<ModuleDeclaration>("getBodyText"), () => {
    function doTest(startCode: string, bodyText: string | undefined) {
      const { firstChild } = getInfoFromText<ModuleDeclaration>(startCode);
      expect(firstChild.getBodyText()).to.equal(bodyText);
    }

    it("should get when there is none", () => {
      doTest("namespace identifier {\n}", "");
    });

    it("should get when there is a lot of whitespace", () => {
      doTest("namespace identifier {\n   \t\n\r\n   \t}", "");
    });

    it("should get without indentation", () => {
      doTest("namespace identifier {\n    export class Test {\n        prop: string;\n    }\n}\n}", "export class Test {\n    prop: string;\n}");
    });
  });
});
