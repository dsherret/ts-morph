import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxText } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxText>(text, SyntaxKind.JsxText, { isJsx: true });
}

describe("JsxText", () => {
    describe(nameof<JsxText>("containsOnlyTriviaWhiteSpaces"), () => {
        function doTest(text: string, value: boolean) {
            const { descendant } = getInfo(text);
            expect(descendant.containsOnlyTriviaWhiteSpaces()).to.equal(value);
        }

        it("should get if it contains only whitespace when it doesn't", () => {
            doTest(`var t = (<jsx>Test</jsx>);`, false);
        });

        it("should get if it contains only whitespace when it does", () => {
            doTest(`var t = (<jsx>\n    <Test /></jsx>);`, true);
        });
    });
});
