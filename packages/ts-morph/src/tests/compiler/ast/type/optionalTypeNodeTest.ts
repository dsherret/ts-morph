import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { OptionalTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("OptionalTypeNode", () => {
  function getNode(text: string) {
    return getInfoFromTextWithDescendant<OptionalTypeNode>(text, SyntaxKind.OptionalType);
  }

  describe(nameof<OptionalTypeNode>("getTypeNode"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getNode(text);
      expect(descendant.getTypeNode().getText()).to.equal(expected);
    }

    it("should get the type", () => {
      doTest("type T = [string, number?]", "number");
    });
  });
});
