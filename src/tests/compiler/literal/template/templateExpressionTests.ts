import * as ts from "typescript";
import {expect} from "chai";
import {TemplateExpression} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.TemplateExpression)
    ) as TemplateExpression;
    return {...obj, expression};
}

describe(nameof(TemplateExpression), () => {
    const templateHead = "`foo${";
    const templateSpan = "test}`";
    const expr = `${templateHead}${templateSpan}`;
    describe(nameof<TemplateExpression>(n => n.getHead), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getHead().getText()).to.equal(expectedText);
        }

        it("should get the correct template head", () => {
            doTest(expr, templateHead);
        });
    });

    describe(nameof<TemplateExpression>(n => n.getTemplateSpans), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getTemplateSpans()[0].getText()).to.equal(expectedText);
        }

        it("should get the correct template spans", () => {
            doTest(expr, templateSpan);
        });
    });
});
