import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { MetaProperty } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("MetaProperty", () => {
  describe(nameof<MetaProperty>("getKeywordToken"), () => {
    function doTest(text: string, expectedText: SyntaxKind) {
      const { descendant } = getInfoFromTextWithDescendant<MetaProperty>(text, SyntaxKind.MetaProperty);
      expect(descendant.getKeywordToken()).to.equal(expectedText);
    }

    it("should get the correct keyword token", () => {
      doTest("new.target", SyntaxKind.NewKeyword);
    });
  });
});
