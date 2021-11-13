import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TupleTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("TupleTypeNode", () => {
  function getNode(text: string) {
    return getInfoFromTextWithDescendant<TupleTypeNode>(text, SyntaxKind.TupleType);
  }

  describe(nameof<TupleTypeNode>("getElements"), () => {
    it("should get the element type nodes of the tuple type node", () => {
      const { descendant } = getNode("var t: [string, number];");
      expect(descendant.getElements().map(t => t.getText())).to.deep.equal(["string", "number"]);
    });
  });
});
