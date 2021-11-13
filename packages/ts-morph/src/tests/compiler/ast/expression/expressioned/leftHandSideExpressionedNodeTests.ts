import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { LeftHandSideExpressionedNode, NewExpression } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe("LeftHandSideExpressionedNode", () => {
  describe(nameof<LeftHandSideExpressionedNode>("getExpression"), () => {
    function doTest(text: string, expectedText: string) {
      const { descendant } = getInfoFromTextWithDescendant<NewExpression>(text, SyntaxKind.NewExpression);
      expect(descendant.getExpression().getText()).to.equal(expectedText);
    }

    it("should get the correct expression", () => {
      doTest("new x(y)", "x");
    });
  });
});
