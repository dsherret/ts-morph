import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxAttribute, JsxSelfClosingElement } from "../../../../compiler";
import { JsxAttributeStructure, StructureKind } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromTextWithDescendant, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

function getInfo(text: string) {
  return getInfoFromTextWithDescendant<JsxAttribute>(text, SyntaxKind.JsxAttribute, { isJsx: true });
}

function getInfoForSelfClosingElement(text: string) {
  return getInfoFromTextWithDescendant<JsxSelfClosingElement>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe("JsxAttribute", () => {
  describe(nameof<JsxAttribute>("getNameNode"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getInfo(text);
      expect(descendant.getNameNode().getText()).to.equal(expected);
    }

    it("should get the name", () => {
      doTest(`var t = (<jsx attribute="4" />);`, "attribute");
    });
  });

  describe("rename", () => {
    function doTest(text: string, newName: string, expected: string) {
      const { descendant, sourceFile } = getInfo(text);
      descendant.getNameNode().rename(newName);
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should get the name", () => {
      doTest(`var t = (<jsx attribute="4" />);`, "newName", `var t = (<jsx newName="4" />);`);
    });
  });

  describe(nameof<JsxAttribute>("getInitializer"), () => {
    function doTest(text: string, expected: string | undefined) {
      const { descendant } = getInfo(text);
      const initializer = descendant.getInitializer();
      expect(initializer?.getText()).to.equal(expected);
    }

    it("should get the initializer when it exists and is a string literal", () => {
      doTest(`var t = (<jsx attribute="4" />);`, `"4"`);
    });

    it("should get the initializer when it exists and is an expression", () => {
      doTest(`var t = (<jsx attribute={4} />);`, `{4}`);
    });

    it("should return undefined when the initializer does not exists", () => {
      doTest(`var t = (<jsx attribute />);`, undefined);
    });
  });

  describe(nameof<JsxAttribute>("getInitializerOrThrow"), () => {
    function doTest(text: string, expected: string | undefined) {
      const { descendant } = getInfo(text);
      if (expected == null)
        expect(() => descendant.getInitializerOrThrow()).to.throw();
      else
        expect(descendant.getInitializerOrThrow().getText()).to.equal(expected);
    }

    it("should get the initializer when it exists", () => {
      doTest(`var t = (<jsx attribute="4" />);`, `"4"`);
    });

    it("should throw when the initializer does not exists", () => {
      doTest(`var t = (<jsx attribute />);`, undefined);
    });
  });

  describe(nameof<JsxAttribute>("setInitializer"), () => {
    function doTest(text: string, initializerText: string | WriterFunction, expected: string) {
      const { descendant, sourceFile } = getInfoForSelfClosingElement(text);
      (descendant.getAttributes()[0] as JsxAttribute).setInitializer(initializerText);
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should set when one doesn't exist", () => {
      doTest(`var t = (<jsx attribute />);`, writer => writer.quote("5"), `var t = (<jsx attribute="5" />);`);
    });

    it("should set when is a quote", () => {
      doTest(`var t = (<jsx attribute="5" />);`, "{6}", `var t = (<jsx attribute={6} />);`);
    });

    it("should remove when empty", () => {
      doTest(`var t = (<jsx attribute="5" />);`, "", `var t = (<jsx attribute />);`);
    });
  });

  describe(nameof<JsxAttribute>("removeInitializer"), () => {
    function doTest(text: string, expected: string) {
      const { descendant, sourceFile } = getInfoForSelfClosingElement(text);
      (descendant.getAttributes()[0] as JsxAttribute).removeInitializer();
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should remove the initializer when it is a string", () => {
      doTest(`var t = (<jsx attribute="4" />);`, `var t = (<jsx attribute />);`);
    });

    it("should remove the initializer when it is an expression", () => {
      doTest(`var t = (<jsx attribute={5} />);`, `var t = (<jsx attribute />);`);
    });

    it("should do nothing when it doesn't exist", () => {
      doTest(`var t = (<jsx attribute />);`, `var t = (<jsx attribute />);`);
    });
  });

  describe(nameof<JsxAttribute>("remove"), () => {
    function doTest(text: string, index: number, expected: string) {
      const { descendant, sourceFile } = getInfoForSelfClosingElement(text);
      (descendant.getAttributes()[index] as JsxAttribute).remove();
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should remove the only attribute", () => {
      doTest(`var t = (<jsx attribute="4" />);`, 0, `var t = (<jsx />);`);
    });

    it("should remove the attribute at the start", () => {
      doTest(`var t = (<jsx attribute="4" a2 />);`, 0, `var t = (<jsx a2 />);`);
    });

    it("should remove the attribute in the middle", () => {
      doTest(`var t = (<jsx a1 a2 a3 />);`, 1, `var t = (<jsx a1 a3 />);`);
    });

    it("should remove the attribute at the end", () => {
      doTest(`var t = (<jsx a1 a2 />);`, 1, `var t = (<jsx a1 />);`);
    });

    it("should remove the attribute at the end when on a new line", () => {
      doTest(`var t = (<jsx a1\n    a2 />);`, 1, `var t = (<jsx a1 />);`);
    });
  });

  describe(nameof<JsxAttribute>("set"), () => {
    function doTest(text: string, structure: Partial<JsxAttributeStructure>, expected: string) {
      const { descendant, sourceFile } = getInfo(text);
      descendant.set(structure);
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should do nothing when empty", () => {
      const code = `var t = (<jsx a1={5} />);`;
      doTest(code, {}, code);
    });

    it("should set everything when provided", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<JsxAttributeStructure>> = {
        initializer: "{6}",
        name: "newName",
      };
      doTest(`var t = (<jsx a1={5} />);`, structure, `var t = (<jsx newName={6} />);`);
    });

    it("should remove the initializer when providing undefined", () => {
      doTest(`var t = (<jsx a1={5} />);`, { initializer: undefined }, `var t = (<jsx a1 />);`);
    });
  });

  describe(nameof<JsxAttribute>("getStructure"), () => {
    function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<JsxAttributeStructure>>) {
      const { descendant } = getInfo(text);
      const structure = descendant.getStructure();
      expect(structure).to.deep.equal(expectedStructure);
    }

    it("should get the structure when has no initializer", () => {
      doTest(`var t = (<jsx a1 />`, {
        kind: StructureKind.JsxAttribute,
        name: "a1",
        initializer: undefined,
      });
    });

    it("should get the structure when has a string initializer", () => {
      doTest(`var t = (<jsx a1="1" />`, {
        kind: StructureKind.JsxAttribute,
        name: "a1",
        initializer: `"1"`,
      });
    });

    it("should get the structure when has an expression initializer", () => {
      doTest(`var t = (<jsx a1={1} />`, {
        kind: StructureKind.JsxAttribute,
        name: "a1",
        initializer: `{1}`,
      });
    });
  });
});
