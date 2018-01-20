import * as ts from "typescript";
import {expect} from "chai";
import {TemplateExpression} from "./../../../../compiler";
import {getInfoFromTextWithDescendant} from "./../../testHelpers";

function getExpression(text: string) {
    return getInfoFromTextWithDescendant<TemplateExpression>(text, ts.SyntaxKind.TemplateExpression).descendant;
}

describe(nameof(TemplateExpression), () => {
    const templateHead = "`foo${";
    const templateSpan = "test}`";
    const expr = `${templateHead}${templateSpan}`;
    describe(nameof<TemplateExpression>(n => n.getHead), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getHead().getText()).to.equal(expectedText);
        }

        it("should get the correct template head", () => {
            doTest(expr, templateHead);
        });
    });

    describe(nameof<TemplateExpression>(n => n.getTemplateSpans), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getTemplateSpans()[0].getText()).to.equal(expectedText);
        }

        it("should get the correct template spans", () => {
            doTest(expr, templateSpan);
        });
    });
});
