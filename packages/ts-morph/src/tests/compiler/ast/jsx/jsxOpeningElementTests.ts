import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxOpeningElement } from "../../../../compiler";
import { StructureKind } from "../../../../structures";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfo(text: string) {
  return getInfoFromTextWithDescendant<JsxOpeningElement>(text, SyntaxKind.JsxOpeningElement, { isJsx: true });
}

describe("JsxOpeningElement", () => {
  describe(nameof<JsxOpeningElement>("getTagNameNode"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getInfo(text);
      expect(descendant.getTagNameNode().getText()).to.equal(expected);
    }

    it("should get the tag name", () => {
      doTest(`var t = (<jsx></jsx>);`, "jsx");
    });
  });

  describe(nameof<JsxOpeningElement>("addAttribute"), () => {
    it("should add the attribute", () => {
      const { descendant } = getInfo("<jsx></jsx>")
      descendant.addAttribute({
        name: "attribute",
      })

      expect(descendant.getFullText()).to.equal("<jsx attribute>")
    });

    it("should add attribute with initializer", () => {
      const { descendant } = getInfo("<jsx></jsx>")
      descendant.addAttribute({
        name: "attribute",
        initializer: `"value"`
      })

      expect(descendant.getFullText()).to.equal(`<jsx attribute="value">`)
    });

    it("should add attribute with leadingTrivia", () => {
      const { descendant } = getInfo("<jsx></jsx>")
      descendant.addAttribute({
        name: "attribute",
        initializer: `"value"`,
        leadingTrivia: "// comment",
      })

      expect(descendant.getFullText()).to.equal(`<jsx // comment\n    attribute="value">`)
    });

    it("should add spread attribute with leadingTrivia", () => {
      const { descendant } = getInfo("<jsx></jsx>")
      descendant.addAttribute({
        kind: StructureKind.JsxSpreadAttribute,
        expression: "props",
        leadingTrivia: "// comment",
      })

      expect(descendant.getFullText()).to.equal(`<jsx // comment\n    ...props>`)
    });
  });
});
