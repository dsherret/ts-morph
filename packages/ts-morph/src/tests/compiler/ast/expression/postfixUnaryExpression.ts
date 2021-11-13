import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { PostfixUnaryExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("PostfixUnaryExpression", () => {
  const expression = "x";
  const expr = `${expression}++`;
  const { descendant: postfixUnaryExpression } = getInfoFromTextWithDescendant<PostfixUnaryExpression>(expr, SyntaxKind.PostfixUnaryExpression);

  describe(nameof<PostfixUnaryExpression>("getOperand"), () => {
    it("should get the correct expression", () => {
      expect(postfixUnaryExpression.getOperand()!.getText()).to.equal(expression);
    });
  });

  describe(nameof<PostfixUnaryExpression>("getOperatorToken"), () => {
    it("should return the operator token", () => {
      expect(postfixUnaryExpression.getOperatorToken()).to.equal(SyntaxKind.PlusPlusToken);
    });
  });
});
