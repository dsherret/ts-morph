import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ThrowStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
  return getInfoFromTextWithDescendant<ThrowStatement>(text, SyntaxKind.ThrowStatement).descendant;
}

describe("ThrowStatement", () => {
  describe(nameof<ThrowStatement>("getExpression"), () => {
    function doTest(text: string, expectedText: string | undefined) {
      const statement = getStatement(text);
      expect(statement.getExpression().getText()).to.equal(expectedText);
    }

    it("should return the correct expression", () => {
      doTest("throw new Error('foo');", "new Error('foo')");
    });
  });
});
