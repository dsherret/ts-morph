import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CallExpression, ImportExpressionedNode } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe("ImportExpressionedNode", () => {
  describe(nameof<ImportExpressionedNode>("getExpression"), () => {
    function doTest(text: string, expectedText: string) {
      const { descendant } = getInfoFromTextWithDescendant<CallExpression>(text, SyntaxKind.CallExpression);
      expect(descendant.getExpression().getText()).to.equal(expectedText);
    }

    it("should get the correct expression", () => {
      doTest("import(x)", "import");
    });
  });
});
