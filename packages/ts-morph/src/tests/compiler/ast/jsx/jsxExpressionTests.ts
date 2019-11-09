import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JsxExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfo(text: string) {
    return getInfoFromTextWithDescendant<JsxExpression>(text, SyntaxKind.JsxExpression, { isJsx: true });
}

describe(nameof(JsxExpression), () => {
    describe(nameof<JsxExpression>(n => n.getExpression), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getExpression()?.getText()).to.equal(expected);
        }

        it("should get the expression", () => {
            doTest(`var t = (<jsx>{test}</jsx>);`, "test");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest(`var t = (<jsx>{}</jsx>);`, undefined);
        });
    });

    describe(nameof<JsxExpression>(n => n.getExpressionOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            if (expected == null)
                expect(() => descendant.getExpressionOrThrow()).to.throw();
            else
                expect(descendant.getExpressionOrThrow().getText()).to.equal(expected);
        }

        it("should get the expression", () => {
            doTest(`var t = (<jsx>{test}</jsx>);`, "test");
        });

        it("should throw when it doesn't exist", () => {
            doTest(`var t = (<jsx>{}</jsx>);`, undefined);
        });
    });

    describe(nameof<JsxExpression>(n => n.getDotDotDotToken), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getDotDotDotToken()?.getText()).to.equal(expected);
        }

        it("should get the dot dot dot token", () => {
            doTest(`var t = (<jsx>{...test}</jsx>);`, "...");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest(`var t = (<jsx>{test}</jsx>);`, undefined);
        });
    });

    describe(nameof<JsxExpression>(n => n.getDotDotDotTokenOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            if (expected == null)
                expect(() => descendant.getDotDotDotTokenOrThrow()).to.throw();
            else
                expect(descendant.getDotDotDotTokenOrThrow().getText()).to.equal(expected);
        }

        it("should get the dot dot dot token", () => {
            doTest(`var t = (<jsx>{...test}</jsx>);`, "...");
        });

        it("should throw when it doesn't exist", () => {
            doTest(`var t = (<jsx>{test}</jsx>);`, undefined);
        });
    });
});
