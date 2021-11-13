import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ExpressionedNode, ParenthesizedExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("ExpressionedNode", () => {
  describe(nameof<ExpressionedNode>("getExpression"), () => {
    function doTest(text: string, expectedText: string) {
      const { descendant } = getInfoFromTextWithDescendant<ParenthesizedExpression>(text, SyntaxKind.ParenthesizedExpression);
      expect(descendant.getExpression().getText()).to.equal(expectedText);
    }

    it("should get the correct expression", () => {
      doTest("(x + 1)", "x + 1");
    });
  });
});
