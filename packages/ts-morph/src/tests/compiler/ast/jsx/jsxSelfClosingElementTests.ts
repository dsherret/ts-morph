import { errors,  nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxSelfClosingElement } from "../../../../compiler";
import { JsxAttributeStructure, JsxSelfClosingElementStructure, StructureKind } from "../../../../structures";
import { getInfoFromTextWithDescendant, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

function getInfo(text: string) {
  return getInfoFromTextWithDescendant<JsxSelfClosingElement>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe("JsxSelfClosingElement", () => {
  describe(nameof<JsxSelfClosingElement>("getTagNameNode"), () => {
    function doTest(text: string, expected: string) {
      const { descendant } = getInfo(text);
      expect(descendant.getTagNameNode().getText()).to.equal(expected);
    }

    it("should get the tag name", () => {
      doTest(`var t = (<jsx />);`, "jsx");
    });
  });

  describe(nameof<JsxSelfClosingElement>("getAttributes"), () => {
    function doTest(text: string, expected: string[]) {
      const { descendant } = getInfo(text);
      expect(descendant.getAttributes().map(c => c.getText())).to.deep.equal(expected);
    }

    it("should get the attributes", () => {
      doTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} />);`, ["attrib1", "attrib2={5}", "{...attribs}"]);
    });
  });

  describe(nameof<JsxSelfClosingElement>("set"), () => {
    function doTest(text: string, structure: Partial<JsxSelfClosingElementStructure>, expected: string) {
      const { descendant, sourceFile } = getInfo(text);
      descendant.set(structure);
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should not change when empty", () => {
      const code = "const v = <div attr />";
      doTest(code, {}, code);
    });

    it("should change when all set", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<JsxSelfClosingElementStructure>> = {
        attributes: [{ name: "attr" }],
        name: "newName",
      };
      doTest("const v = <div a1 a2 />", structure, "const v = <newName attr />");
    });
  });

  describe(nameof<JsxSelfClosingElement>("getStructure"), () => {
    function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<JsxSelfClosingElementStructure>>) {
      const { descendant } = getInfo(text);
      const structure = descendant.getStructure();
      structure.attributes = structure.attributes!.map(a => ({ name: (a as JsxAttributeStructure).name }));
      expect(structure).to.deep.equal(expectedStructure);
    }

    it("should get the structure", () => {
      doTest(`var t = (<jsx attrib1 />);`, {
        kind: StructureKind.JsxSelfClosingElement,
        attributes: [{ name: "attrib1" }],
        name: "jsx",
      });
    });
  });

  describe(nameof<JsxSelfClosingElement>("addAttribute"), () => {
    it("should add the attribute", () => {
      const { descendant } = getInfo(`<jsx />`);
      descendant.addAttribute({
        name: "attribute",
      });

      expect(descendant.getFullText()).to.equal("<jsx attribute />");
    });

    it("should add attribute with initializer", () => {
      const { descendant } = getInfo(`<jsx />`);
      descendant.addAttribute({
        name: "attribute",
        initializer: `"value"`,
      });

      expect(descendant.getFullText()).to.equal(`<jsx attribute="value" />`);
    });

    it("should add attribute with leadingTrivia", () => {
      const { descendant } = getInfo(`<jsx />`);
      descendant.addAttribute({
        name: "attribute",
        initializer: `"value"`,
        leadingTrivia: "// comment",
      });

      expect(descendant.getFullText()).to.equal(`<jsx // comment\n    attribute="value" />`);
    });

    it("should add spread attribute with leadingTrivia", () => {
      const { descendant } = getInfo("<jsx />");
      descendant.addAttribute({
        kind: StructureKind.JsxSpreadAttribute,
        expression: "props",
        leadingTrivia: "// comment",
      });

      expect(descendant.getFullText()).to.equal(`<jsx // comment\n    {...props} />`);
    });
  });

  describe(nameof<JsxSelfClosingElement>("addAttributes"), () => {
    it("should add the attributes", () => {
      const { descendant } = getInfo("<jsx />");
      descendant.addAttributes([{
        name: "attribute1",
      }, {
        name: "attribute2",
      }]);

      expect(descendant.getFullText()).to.equal("<jsx attribute1 attribute2 />");
    });

    it("should add attributes with initializers", () => {
      const { descendant } = getInfo("<jsx />");
      descendant.addAttributes([{
        name: "attribute1",
        initializer: `"value1"`,
      }, {
        name: "attribute2",
        initializer: `"value2"`,
      }]);

      expect(descendant.getFullText()).to.equal(`<jsx attribute1="value1" attribute2="value2" />`);
    });

    it("should add attributes with leadingTrivia", () => {
      const { descendant } = getInfo("<jsx />");
      descendant.addAttributes([{
        name: "attribute1",
        initializer: `"value1"`,
        leadingTrivia: "// comment1",
      }, {
        name: "attribute2",
        initializer: `"value2"`,
        leadingTrivia: "// comment2",
      }]);

      expect(descendant.getFullText()).to.equal(`<jsx // comment1\n    attribute1="value1" // comment2\n    attribute2="value2" />`);
    });

    it("should add spread attributes with leadingTrivia", () => {
      const { descendant } = getInfo("<jsx />");
      descendant.addAttributes([{
        kind: StructureKind.JsxSpreadAttribute,
        expression: "props1",
        leadingTrivia: "// comment1",
      }, {
        kind: StructureKind.JsxSpreadAttribute,
        expression: "props2",
        leadingTrivia: "// comment2",
      }]);

      expect(descendant.getFullText()).to.equal(`<jsx // comment1\n    {...props1} // comment2\n    {...props2} />`);
    });
  });

  describe(nameof<JsxSelfClosingElement>("remove"), () => {
    function doRemove(text: string) {
      const { descendant, sourceFile } = getInfo(text);
      descendant.remove();
    }

    function doTestWithJsxSelfClosingElementChild(text: string, expected: string) {
      const { descendant, sourceFile } = getInfo(text);
      descendant.remove();
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should not remove the root JsxSelfClosingElement", () => {
      let error = null;

      try {
        doRemove(`var t = (<jsx />);`);
      }
      catch (err) {
        error = err;
      }

      expect(error).to.be.instanceOf(errors.InvalidOperationError);
    });

    it("should remove the JsxSelfClosingElement child", () => {
      doTestWithJsxSelfClosingElementChild(`var t = (<jsx><jsx2 /></jsx>);`, `var t = (<jsx></jsx>);`);
    });
  });
});
