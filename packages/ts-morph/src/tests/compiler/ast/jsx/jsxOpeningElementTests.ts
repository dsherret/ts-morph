import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxOpeningElement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxOpeningElement>(text, SyntaxKind.JsxOpeningElement, { isJsx: true });
}

describe(nameof(JsxOpeningElement), () => {
    describe(nameof<JsxOpeningElement>(n => n.getTagNameNode), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getTagNameNode().getText()).to.equal(expected);
        }

        it("should get the tag name", () => {
            doTest(`var t = (<jsx></jsx>);`, "jsx");
        });
    });
});
