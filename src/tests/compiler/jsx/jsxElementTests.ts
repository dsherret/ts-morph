import * as ts from "typescript";
import {expect} from "chai";
import {JsxElement} from "./../../../compiler";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxElement>(text, ts.SyntaxKind.JsxElement, { isJsx: true });
}

describe(nameof(JsxElement), () => {
    describe(nameof<JsxElement>(n => n.getOpeningElement), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getOpeningElement().getText()).to.equal(expected);
        }

        it("should get the opening element", () => {
            doTest(`var t = (<jsx></jsx>);`, "<jsx>");
        });
    });

    describe(nameof<JsxElement>(n => n.getClosingElement), () => {
        function doTest(text: string, expected: string) {
            const {descendant} = getInfo(text);
            expect(descendant.getClosingElement().getText()).to.equal(expected);
        }

        it("should get the closing element", () => {
            doTest(`var t = (<jsx></jsx>);`, "</jsx>");
        });
    });

    describe(nameof<JsxElement>(n => n.getJsxChildren), () => {
        function doTest(text: string, expected: string[]) {
            const {descendant} = getInfo(text);
            expect(descendant.getJsxChildren().map(c => c.getText())).to.deep.equal(expected);
        }

        it("should get the children", () => {
            doTest(`var t = (<jsx>\n    <Child1 />\n    <Child2 />\n</jsx>);`, ["", "<Child1 />", "", "<Child2 />", ""]);
        });
    });
});
