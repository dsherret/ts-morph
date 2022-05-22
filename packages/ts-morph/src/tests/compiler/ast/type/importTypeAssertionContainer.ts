import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ImportTypeAssertionContainer } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("ImportTypeAssertionContainer", () => {
  function getNode(text: string) {
    return getInfoFromTextWithDescendant<ImportTypeAssertionContainer>(text, SyntaxKind.ImportTypeAssertionContainer);
  }

  describe(nameof<ImportTypeAssertionContainer>("getAssertClause"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getNode(text);
      expect(descendant.getAssertClause().getText()).to.equal(expected);
    }

    it("should get the assert clause", () => {
      doTest("var t: import('testing', { assert: { type: 'json' } });", "{ type: 'json' }");
    });
  });
});
