import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { RestTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("RestTypeNode", () => {
  function getNode(text: string) {
    return getInfoFromTextWithDescendant<RestTypeNode>(text, SyntaxKind.RestType);
  }

  describe(nameof<RestTypeNode>("getTypeNode"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getNode(text);
      expect(descendant.getTypeNode().getText()).to.equal(expected);
    }

    it("should get the type", () => {
      doTest("type Test<T> = [...T]", "T");
    });
  });
});
