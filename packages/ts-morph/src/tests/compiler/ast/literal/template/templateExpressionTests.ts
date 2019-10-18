import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TemplateExpression } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

function getExpression(text: string) {
    return getInfoFromTextWithDescendant<TemplateExpression>(text, SyntaxKind.TemplateExpression).descendant;
}

describe(nameof(TemplateExpression), () => {
    describe(nameof<TemplateExpression>(n => n.getHead), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getHead().getText()).to.equal(expectedText);
        }

        it("should get the correct template head", () => {
            doTest("`foo${test}`", "`foo${");
        });
    });

    describe(nameof<TemplateExpression>(n => n.getTemplateSpans), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getTemplateSpans()[0].getText()).to.equal(expectedText);
        }

        it("should get the correct template spans", () => {
            doTest("`foo${test}`", "test}`");
        });
    });

    describe(nameof<TemplateExpression>(n => n.setLiteralValue), () => {
        function doTest(text: string, newText: string, expectedText: string) {
            const expression = getExpression(text);
            const sourceFile = expression._sourceFile;
            expect(expression.setLiteralValue(newText).wasForgotten()).to.be.false;
            expect(sourceFile.getText()).to.equal(expectedText);
        }

        it("should set the value", () => {
            doTest("`foo${test}`", "testing${this}out", "`testing${this}out`");
        });

        it("should set the value to not have any tagged templates", () => {
            doTest("`foo${test}`", "testing", "`testing`");
        });
    });
});
