import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrowFunction } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
  const info = getInfoFromTextWithDescendant<ArrowFunction>(text, SyntaxKind.ArrowFunction);
  return { ...info, expression: info.descendant };
}

describe("ArrowFunction", () => {
  describe(nameof<ArrowFunction>("addTypeParameters"), () => {
    for (
      const [text, expectedText] of [
        ["(value) => value", "<T>(value) => value"],
        ["() => 1", "<T>() => 1"],
        ["async (value) => value", "async <T>(value) => value"],
        ["value => value", "<T>(value) => value"],
        ["async value => value", "async <T>(value) => value"],
        ["value /* comment */ => value", "<T>(value) /* comment */ => value"],
      ]
    ) {
      it(`should add type parameters to ${text}`, () => {
        const { expression } = getInfoFromTextWithExpression(text);
        const parameter = expression.getParameters()[0];
        const name = parameter?.getNameNode();
        const result = expression.addTypeParameters(["T"]);
        expect(expression.getText()).to.equal(expectedText);
        expect(result.map(p => p.getName())).to.deep.equal(["T"]);
        expect(expression.getTypeParameters()[0]).to.equal(result[0]);
        if (parameter != null) {
          expect(expression.getParameters()[0]).to.equal(parameter);
          expect(parameter.getNameNode()).to.equal(name);
          expect(parameter.getText()).to.equal("value");
        }
      });
    }

    for (const prefix of ["", "async "]) {
      it(`should preserve a cached parameter name in ${prefix}value => value`, () => {
        const { expression } = getInfoFromTextWithExpression(`${prefix}value => value`);
        const name = expression.getParameters()[0].getNameNode().asKindOrThrow(SyntaxKind.Identifier);
        expression.addTypeParameters(["T"]);
        name.rename("item");
        expect(expression.getText()).to.equal(`${prefix}<T>(item) => item`);
      });
    }

    it("should disambiguate a single type parameter from JSX", () => {
      const { descendant } = getInfoFromTextWithDescendant<ArrowFunction>("value => value", SyntaxKind.ArrowFunction, { isJsx: true });
      descendant.addTypeParameters(["T"]);
      expect(descendant.getText()).to.equal("<T,>(value) => value");
      expect(descendant.getTypeParameters()[0].getName()).to.equal("T");
    });

    it("should add multiple type parameters in JSX", () => {
      const { descendant } = getInfoFromTextWithDescendant<ArrowFunction>("(value) => value", SyntaxKind.ArrowFunction, { isJsx: true });
      descendant.addTypeParameters(["T", "U extends T"]);
      expect(descendant.getText()).to.equal("<T, U extends T>(value) => value");
    });

    it("should append to existing type parameters", () => {
      const { expression } = getInfoFromTextWithExpression("<T>(value: T) => value");
      expression.addTypeParameters(["U extends T"]);
      expect(expression.getText()).to.equal("<T, U extends T>(value: T) => value");
    });

    it("should leave an unparenthesized parameter unchanged when no type parameters are added", () => {
      const { expression } = getInfoFromTextWithExpression("value => value");
      expect(expression.addTypeParameters([])).to.deep.equal([]);
      expect(expression.getText()).to.equal("value => value");
    });

    it("should leave an unparenthesized parameter unchanged when the index is invalid", () => {
      const { expression } = getInfoFromTextWithExpression("value => value");
      expect(() => expression.insertTypeParameter(1, "T")).to.throw();
      expect(expression.getText()).to.equal("value => value");
    });
  });

  describe(nameof<ArrowFunction>("getEqualsGreaterThan"), () => {
    function doTest(text: string, expectedText: string) {
      const { expression } = getInfoFromTextWithExpression(text);
      expect(expression.getEqualsGreaterThan().getText()).to.equal(expectedText);
    }

    it("should get the correct equals greater than token", () => {
      doTest("(x) => {}", "=>");
    });
  });
});
