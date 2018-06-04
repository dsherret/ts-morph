import { expect } from "chai";
import { JsxText } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxText>(text, SyntaxKind.JsxText, { isJsx: true });
}

describe(nameof(JsxText), () => {
    describe(nameof<JsxText>(n => n.containsOnlyWhiteSpaces), () => {
        function doTest(text: string, value: boolean) {
            const {descendant} = getInfo(text);
            expect(descendant.containsOnlyWhiteSpaces()).to.equal(value);
        }

        it("should get if it contains only whitespace when it doesn't", () => {
            doTest(`var t = (<jsx>Test</jsx>);`, false);
        });

        it("should get if it contains only whitespace when it does", () => {
            doTest(`var t = (<jsx>\n    <Test /></jsx>);`, true);
        });
    });
});
