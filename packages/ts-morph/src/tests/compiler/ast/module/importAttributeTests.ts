import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ImportAttribute, ImportAttributes } from "../../../../compiler";
import { ImportAttributeStructure } from "../../../../structures";
import { getInfoFromTextWithDescendant, OptionalKindAndTrivia } from "../../testHelpers";

describe("importAttributes", () => {
  function getNode(text: string) {
    return getInfoFromTextWithDescendant<ImportAttributes>(text, SyntaxKind.ImportAttributes);
  }

  describe(nameof<ImportAttributes>("getElements"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getNode(text);
      expect(descendant.getElements().find(e => e.getName() === "type")!.getText()).to.equal(expected);
    }

    it("should get the assert clause", () => {
      doTest("var t: import('testing', { assert: { type: 'json' } });", "type: 'json'");
    });
  });
});

describe("ImportAttribute", () => {
  function getImportAttribute(text: string) {
    return getInfoFromTextWithDescendant<ImportAttribute>(text, SyntaxKind.ImportAttribute);
  }

  describe(nameof<ImportAttribute>("set"), () => {
    function doTest(text: string, structure: Partial<ImportAttributeStructure>, expectedText: string) {
      const { descendant, sourceFile } = getImportAttribute(text);
      descendant.set(structure);
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should set everything when specified", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<ImportAttributeStructure>> = {
        name: "test",
        value: "'asdf'",
      };
      doTest(
        "import * as a from 'test' with { name: 'value' };",
        structure,
        "import * as a from 'test' with { test: 'asdf' };",
      );
    });
  });
});
