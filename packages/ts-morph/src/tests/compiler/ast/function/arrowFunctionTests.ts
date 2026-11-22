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

    for (
      const [text, typeParameter] of [
        ["x => x", ""],
        ["async x => x", "1"],
      ]
    ) {
      it(`should leave ${text} unchanged when inserting the invalid type parameter '${typeParameter}'`, () => {
        const { expression } = getInfoFromTextWithExpression(text);
        const sourceFile = expression.getSourceFile();
        const fullText = sourceFile.getFullText();
        expect(() => expression.addTypeParameter(typeParameter)).to.throw();
        expect(sourceFile.getFullText()).to.equal(fullText);
      });
    }

    it("should leave an unparenthesized parameter unchanged when the index is invalid", () => {
      const { expression } = getInfoFromTextWithExpression("value => value");
      expect(() => expression.insertTypeParameter(1, "T")).to.throw();
      expect(expression.getText()).to.equal("value => value");
    });
  });

  describe("unparenthesized parameter", () => {
    for (const prefix of ["", "async "]) {
      it(`should add parens when setting the return type of ${prefix}x => x`, () => {
        const { expression } = getInfoFromTextWithExpression(`${prefix}x => x`);
        const parameter = expression.getParameters()[0];
        const name = parameter.getNameNode();
        expression.setReturnType("number");
        expect(expression.getText()).to.equal(`${prefix}(x): number => x`);
        expect(expression.getParameters()[0]).to.equal(parameter);
        expect(parameter.getNameNode()).to.equal(name);
      });

      it(`should add parens when appending a parameter to ${prefix}x => x`, () => {
        const { expression } = getInfoFromTextWithExpression(`${prefix}x => x`);
        const parameter = expression.getParameters()[0];
        const name = parameter.getNameNode();
        const added = expression.addParameter({ name: "y" });
        expect(expression.getText()).to.equal(`${prefix}(x, y) => x`);
        expect(expression.getParameters()).to.deep.equal([parameter, added]);
        expect(parameter.getNameNode()).to.equal(name);
      });

      it(`should add parens when removing the parameter of ${prefix}x => 1`, () => {
        const { expression } = getInfoFromTextWithExpression(`${prefix}x => 1`);
        expression.getParameters()[0].remove();
        expect(expression.getText()).to.equal(`${prefix}() => 1`);
        expect(expression.getParameters()).to.deep.equal([]);
      });
    }

    it("should keep the existing parameter when inserting multiple parameters at the start", () => {
      const { expression } = getInfoFromTextWithExpression("x => x");
      const parameter = expression.getParameters()[0];
      const added = expression.insertParameters(0, [{ name: "a" }, { name: "b", type: "string" }]);
      expect(expression.getText()).to.equal("(a, b: string, x) => x");
      expect(expression.getParameters()).to.deep.equal([...added, parameter]);
      expect(parameter.getName()).to.equal("x");
    });

    it("should keep a comment after the parameter", () => {
      const { expression } = getInfoFromTextWithExpression("x /* c */ => x");
      expression.setReturnType("number");
      expect(expression.getText()).to.equal("(x): number /* c */ => x");
    });

    it("should not change the text when no parameters are added", () => {
      const { expression } = getInfoFromTextWithExpression("x => x");
      expect(expression.addParameters([])).to.deep.equal([]);
      expect(expression.getText()).to.equal("x => x");
    });

    it("should not change the text when the parameter index is invalid", () => {
      const { expression } = getInfoFromTextWithExpression("x => x");
      expect(() => expression.insertParameter(2, { name: "y" })).to.throw();
      expect(expression.getText()).to.equal("x => x");
    });

    it("should not change the text when the return type is invalid", () => {
      const { expression } = getInfoFromTextWithExpression("const f = x => x;");
      const sourceFile = expression.getSourceFile();
      const fullText = sourceFile.getFullText();
      expect(() => expression.setReturnType(")")).to.throw();
      expect(sourceFile.getFullText()).to.equal(fullText);
    });

    it("should not change the text when the new parameter is invalid", () => {
      const { expression } = getInfoFromTextWithExpression("x => x");
      const sourceFile = expression.getSourceFile();
      const fullText = sourceFile.getFullText();
      expect(() => expression.addParameter({ name: "1" })).to.throw();
      expect(sourceFile.getFullText()).to.equal(fullText);
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
