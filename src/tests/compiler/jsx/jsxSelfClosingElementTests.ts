import { expect } from "chai";
import { JsxSelfClosingElement } from "../../../compiler";
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
});
