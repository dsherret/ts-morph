import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { ExpressionStatement } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("ExpressionStatement", () => {
  describe(nameof<ExpressionStatement>("getExpression"), () => {
    it("should get the expression", () => {
      const { firstChild } = getInfoFromText<ExpressionStatement>("hello();");
      expect(firstChild.getText()).to.equal("hello();");
      expect(firstChild.getExpression().getText()).to.equal("hello()");
    });
  });

  describe(nameof<ExpressionStatement>("remove"), () => {
    function doTest(text: string, index: number, expectedText: string) {
      const { sourceFile } = getInfoFromText(text);
      (sourceFile.getChildSyntaxListOrThrow().getChildren()[index] as ExpressionStatement).remove();
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should remove the expression statement", () => {
      doTest("hello();\nthere();\ntest();", 1, "hello();\ntest();");
    });
  });
});
