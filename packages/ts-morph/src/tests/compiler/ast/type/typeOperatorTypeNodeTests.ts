import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TypeOperatorTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("TypeOperatorTypeNode", () => {
  function getNode(text: string) {
    return getInfoFromTextWithDescendant<TypeOperatorTypeNode>(text, SyntaxKind.TypeOperator);
  }

  describe(nameof<TypeOperatorTypeNode>("getType"), () => {
    it("should get the type", () => {
      const { descendant } = getNode("var t: readonly string;");
      expect(descendant.getTypeNode().getText()).to.equal("string");
    });
  });
});
