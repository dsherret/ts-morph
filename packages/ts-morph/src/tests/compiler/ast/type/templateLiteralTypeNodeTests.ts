import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TemplateExpression, TemplateLiteralTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getTypeNode(text: string) {
  return getInfoFromTextWithDescendant<TemplateLiteralTypeNode>(text, SyntaxKind.TemplateLiteralType).descendant;
}

describe("TemplateLiteralTypeNode", () => {
  describe(nameof<TemplateLiteralTypeNode>("getHead"), () => {
    function doTest(text: string, expectedText: string) {
      const expression = getTypeNode(text);
      expect(expression.getHead().getText()).to.equal(expectedText);
    }

    it("should get the correct template head", () => {
      doTest("type Test = `foo${test}`", "`foo${");
    });
  });

  describe(nameof<TemplateLiteralTypeNode>("getTemplateSpans"), () => {
    function doTest(text: string, expectedText: string) {
      const expression = getTypeNode(text);
      expect(expression.getTemplateSpans()[0].getText()).to.equal(expectedText);
    }

    it("should get the correct template spans", () => {
      doTest("type Test = `foo${test}`", "test}`");
    });
  });

  describe(nameof<TemplateLiteralTypeNode>("setLiteralValue"), () => {
    function doTest(text: string, newText: string, expectedText: string) {
      const expression = getTypeNode(text);
      const sourceFile = expression._sourceFile;
      expect(expression.setLiteralValue(newText).wasForgotten()).to.be.false;
      expect(sourceFile.getText()).to.equal(expectedText);
    }

    it("should set the value", () => {
      doTest("type Test = `foo${test}`", "testing${this}out", "type Test = `testing${this}out`");
    });

    it("should set the value to not have any tagged templates", () => {
      doTest("type Test = `foo${test}`", "testing", "type Test = `testing`");
    });
  });
});
