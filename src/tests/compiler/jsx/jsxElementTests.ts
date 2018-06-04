import { expect } from "chai";
import { JsxElement } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxElement>(text, SyntaxKind.JsxElement, { isJsx: true });
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

    describe(nameof<JsxElement>(n => n.setBodyText), () => {
        function doTest(text: string, bodyText: string, expected: string) {
            const {descendant, sourceFile} = getInfo(text);
            descendant.setBodyText(bodyText);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should set the body text", () => {
            doTest("var t = (<jsx></jsx>);", "<element />", "var t = (<jsx>\n    <element />\n</jsx>);");
        });

        it("should set the body text when currently on multiple lines", () => {
            doTest("var t = (\n    <jsx>\n    </jsx>);", "<element />", "var t = (\n    <jsx>\n        <element />\n    </jsx>);");
        });

        it("should set the body text when specifying multiple lines", () => {
            doTest("var t = (<jsx></jsx>);", "<element>\n</element>", "var t = (<jsx>\n    <element>\n    </element>\n</jsx>);");
        });

        it("should set the body text when specifying multiple lines and other elements exist", () => {
            doTest("var t = (<jsx>   <Element> </Element>   </jsx>);", "<element>\n</element>", "var t = (<jsx>\n    <element>\n    </element>\n</jsx>);");
        });
    });

    describe(nameof<JsxElement>(n => n.setBodyTextInline), () => {
        function doTest(text: string, bodyText: string, expected: string) {
            const {descendant, sourceFile} = getInfo(text);
            descendant.setBodyTextInline(bodyText);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should set the body text inline", () => {
            doTest("var t = (<jsx></jsx>);", "<element />", "var t = (<jsx><element /></jsx>);");
        });

        it("should set the body text inline when other elements exist", () => {
            doTest("var t = (<jsx><element2 /></jsx>);", "<element />", "var t = (<jsx><element /></jsx>);");
        });

        it("should indent if writing a new line", () => {
            doTest("var t = (<jsx></jsx>);", "<element>\n</element>", "var t = (<jsx><element>\n    </element></jsx>);");
        });

        it("should indent if ending with a new line", () => {
            doTest("var t = (<jsx></jsx>);", "<element>\n</element>\n", "var t = (<jsx><element>\n    </element>\n</jsx>);");
        });
    });
});
