import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxFragment } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxFragment>(text, SyntaxKind.JsxFragment, { isJsx: true });
}

describe("JsxFragment", () => {
    describe(nameof.property<JsxFragment>("getOpeningFragment"), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getOpeningFragment().getText()).to.equal(expected);
        }

        it("should get the opening fragment", () => {
            doTest(`var t = (<></>);`, "<>");
        });
    });

    describe(nameof.property<JsxFragment>("getClosingFragment"), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getClosingFragment().getText()).to.equal(expected);
        }

        it("should get the closing fragment", () => {
            doTest(`var t = (<></>);`, "</>");
        });
    });

    describe(nameof.property<JsxFragment>("getJsxChildren"), () => {
        function doTest(text: string, expected: string[]) {
            const { descendant } = getInfo(text);
            expect(descendant.getJsxChildren().map(c => c.getText())).to.deep.equal(expected);
        }

        it("should get the children", () => {
            doTest(`var t = (<>\n    <Child1 />\n    <Child2 />\n</>);`, ["", "<Child1 />", "", "<Child2 />", ""]);
        });
    });
});
