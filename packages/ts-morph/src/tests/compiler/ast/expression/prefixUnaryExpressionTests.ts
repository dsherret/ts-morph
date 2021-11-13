import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { PrefixUnaryExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("PrefixUnaryExpression", () => {
  const expression = "x";
  const expr = `++${expression}`;
  const { descendant: prefixUnaryExpression } = getInfoFromTextWithDescendant<PrefixUnaryExpression>(expr, SyntaxKind.PrefixUnaryExpression);

  describe(nameof<PrefixUnaryExpression>("getOperand"), () => {
    it("should get the correct expression", () => {
      expect(prefixUnaryExpression.getOperand()!.getText()).to.equal(expression);
    });
  });

  describe(nameof<PrefixUnaryExpression>("getOperatorToken"), () => {
    it("should return the operator token", () => {
      expect(prefixUnaryExpression.getOperatorToken()).to.equal(SyntaxKind.PlusPlusToken);
    });
  });
});
