import {expect} from "chai";
import {ts, SyntaxKind} from "./../../../typescript";
import {JsxOpeningElement} from "./../../../compiler";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxOpeningElement>(text, SyntaxKind.JsxOpeningElement, { isJsx: true });
}

describe(nameof(JsxOpeningElement), () => {
    describe(nameof<JsxOpeningElement>(n => n.getTagName), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getTagName().getText()).to.equal(expected);
        }

        it("should get the tag name", () => {
            doTest(`var t = (<jsx></jsx>);`, "jsx");
        });
    });

    describe(nameof<JsxOpeningElement>(n => n.getAttributes), () => {
        function doTest(text: string, expected: string[]) {
            const {descendant} = getInfo(text);
            expect(descendant.getAttributes().map(c => c.getText())).to.deep.equal(expected);
        }

        it("should get the attributes", () => {
            doTest(`var t = (<jsx attrib1 attrib2={5} {...attribs}></jsx>);`, ["attrib1", "attrib2={5}", "{...attribs}"]);
        });
    });
});
