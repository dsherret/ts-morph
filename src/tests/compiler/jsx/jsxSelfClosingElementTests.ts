import { expect } from "chai";
import { JsxSelfClosingElement } from "../../../compiler";
import * as errors from "../../../errors";
import { JsxElementStructure, JsxAttributeStructure } from "../../../structures";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxSelfClosingElement>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe(nameof(JsxSelfClosingElement), () => {
    describe(nameof<JsxSelfClosingElement>(n => n.getTagNameNode), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getTagNameNode().getText()).to.equal(expected);
        }

        it("should get the tag name", () => {
            doTest(`var t = (<jsx />);`, "jsx");
        });
    });

    describe(nameof<JsxSelfClosingElement>(n => n.getAttributes), () => {
        function doTest(text: string, expected: string[]) {
            const {descendant} = getInfo(text);
            expect(descendant.getAttributes().map(c => c.getText())).to.deep.equal(expected);
        }

        it("should get the attributes", () => {
            doTest(`var t = (<jsx attrib1 attrib2={5} {...attribs} />);`, ["attrib1", "attrib2={5}", "{...attribs}"]);
        });
    });

    describe(nameof<JsxSelfClosingElement>(n => n.set), () => {
        function doTest(text: string, structure: Partial<JsxElementStructure>, expected: string) {
            const { descendant, sourceFile } = getInfo(text);
            descendant.set(structure);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should not change when empty", () => {
            const code = "const v = <div attr />";
            doTest(code, {}, code);
        });

        it("should change when all set", () => {
            const structure: MakeRequired<JsxElementStructure> = {
                attributes: [{ name: "attr" }],
                bodyText: undefined,
                children: undefined,
                isSelfClosing: true,
                name: "newName"
            };
            doTest("const v = <div a1 a2 />", structure, "const v = <newName attr />");
        });

        function doNotImplementedTest(text: string, structure: Partial<JsxElementStructure>) {
            const { descendant } = getInfo(text);
            expect(() => descendant.set(structure)).to.throw(errors.NotImplementedError);
        }

        it("should throw when setting as non-self closing -- not implemented", () => {
            doNotImplementedTest("const v = <element />;", { isSelfClosing: false });
        });

        it("should throw when setting children -- not implemented", () => {
            doNotImplementedTest("const v = <element />;", { children: [] });
        });

        it("should throw when setting body text -- not implemented", () => {
            doNotImplementedTest("const v = <element />;", { bodyText: "<inner />" });
        });
    });

    describe(nameof<JsxSelfClosingElement>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: MakeRequired<JsxElementStructure>) {
            const { descendant } = getInfo(text);
            const structure = descendant.getStructure();
            structure.attributes = structure.attributes!.map(a => ({ name: (a as JsxAttributeStructure).name }));

            delete expectedStructure.bodyText;
            delete expectedStructure.children;

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get the structure", () => {
            doTest(`var t = (<jsx attrib1 />);`, {
                attributes: [{ name: "attrib1" }],
                bodyText: undefined,
                children: undefined,
                isSelfClosing: true,
                name: "jsx"
            });
        });
    });
});
