import { errors, nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxSelfClosingElement, JsxSpreadAttribute } from "../../../../compiler";
import { JsxSpreadAttributeStructure, StructureKind } from "../../../../structures";
import { getInfoFromTextWithDescendant, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

function getInfo(text: string) {
  return getInfoFromTextWithDescendant<JsxSpreadAttribute>(text, SyntaxKind.JsxSpreadAttribute, { isJsx: true });
}

function getInfoForSelfClosingElement(text: string) {
  return getInfoFromTextWithDescendant<JsxSelfClosingElement>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe("JsxSpreadAttribute", () => {
  describe(nameof<JsxSpreadAttribute>("getExpression"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getInfo(text);
      expect(descendant.getExpression().getText()).to.equal(expected);
    }

    it("should get the expression", () => {
      doTest(`var t = (<jsx {...test} />);`, "test");
    });
  });

  describe(nameof<JsxSpreadAttribute>("setExpression"), () => {
    function doTest(text: string, expression: string, expected: string) {
      const { descendant, sourceFile } = getInfo(text);
      descendant.setExpression(expression);
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should set", () => {
      doTest(`var t = (<jsx {...test} />);`, "newExpr", `var t = (<jsx {...newExpr} />);`);
    });
  });

  describe(nameof<JsxSpreadAttribute>("remove"), () => {
    function doTest(text: string, index: number, expected: string) {
      const { descendant, sourceFile } = getInfoForSelfClosingElement(text);
      (descendant.getAttributes()[index] as JsxSpreadAttribute).remove();
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should remove the only attribute", () => {
      doTest(`var t = (<jsx {...attribute} />);`, 0, `var t = (<jsx />);`);
    });

    it("should remove the attribute at the start", () => {
      doTest(`var t = (<jsx {...attribute} a2 />);`, 0, `var t = (<jsx a2 />);`);
    });

    it("should remove the attribute in the middle", () => {
      doTest(`var t = (<jsx a1 {...a2} a3 />);`, 1, `var t = (<jsx a1 a3 />);`);
    });

    it("should remove the attribute at the end", () => {
      doTest(`var t = (<jsx {...a1} {...a2} />);`, 1, `var t = (<jsx {...a1} />);`);
    });

    it("should remove the attribute at the end when on a new line", () => {
      doTest(`var t = (<jsx a1\n    {...a2} />);`, 1, `var t = (<jsx a1 />);`);
    });
  });

  describe(nameof<JsxSpreadAttribute>("set"), () => {
    function doTest(text: string, structure: Partial<JsxSpreadAttributeStructure>, expected: string) {
      const { descendant, sourceFile } = getInfo(text);
      descendant.set(structure);
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should not change when empty", () => {
      const code = "const v = <div {...attr} />";
      doTest(code, {}, code);
    });

    it("should change when all set", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<JsxSpreadAttributeStructure>> = {
        expression: "newExpr",
      };
      doTest("const v = <div {...attr} />", structure, "const v = <div {...newExpr} />");
    });
  });

  describe(nameof<JsxSpreadAttribute>("getStructure"), () => {
    function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<JsxSpreadAttributeStructure>>) {
      const { descendant } = getInfo(text);
      const structure = descendant.getStructure();
      expect(structure).to.deep.equal(expectedStructure);
    }

    it("should get the structure", () => {
      doTest(`var t = (<jsx {...a1} />`, {
        kind: StructureKind.JsxSpreadAttribute,
        expression: "a1",
      });
    });
  });
});
