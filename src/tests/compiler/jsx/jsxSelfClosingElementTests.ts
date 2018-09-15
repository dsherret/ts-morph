import { expect } from "chai";
import { JsxSelfClosingElement } from "../../../compiler";
import { JsxElementStructure } from "../../../structures";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxSelfClosingElement>(text, SyntaxKind.JsxSelfClosingElement, { isJsx: true });
}

describe(nameof(JsxSelfClosingElement), () => {
    describe(nameof<JsxSelfClosingElement>(n => n.getTagName), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getTagName().getText()).to.equal(expected);
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

    describe(nameof<JsxSelfClosingElement>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: MakeRequired<JsxElementStructure>) {
            const { descendant } = getInfo(text);
            const structure = descendant.getStructure();
            structure.attributes = structure.attributes!.map(a => ({ name: a.name }));

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
