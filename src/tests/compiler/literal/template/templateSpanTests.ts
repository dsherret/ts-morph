import * as ts from "typescript";
import {expect} from "chai";
import {TemplateSpan} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.TemplateSpan)
    ) as TemplateSpan;
    return {...obj, expression};
}

describe(nameof(TemplateSpan), () => {
    const templateHead = "`foo${";
    const templateSpanExpression = "test";
    const templateSpanLiteral = "}abc`";
    const expr = `${templateHead}${templateSpanExpression}${templateSpanLiteral}`;

    describe(nameof<TemplateSpan>(n => n.getLiteral), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getLiteral().getText()).to.equal(expectedText);
        }

        it("should get the correct template span literal", () => {
            doTest(expr, templateSpanLiteral);
        });
    });
});
