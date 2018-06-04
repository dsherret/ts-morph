import { expect } from "chai";
import { JsxClosingElement } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxClosingElement>(text, SyntaxKind.JsxClosingElement, { isJsx: true });
}

describe(nameof(JsxClosingElement), () => {
    describe(nameof<JsxClosingElement>(n => n.getTagName), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getTagName().getText()).to.equal(expected);
        }

        it("should get the tag name", () => {
            doTest(`var t = (<jsx></jsx>);`, "jsx");
        });
    });
});
