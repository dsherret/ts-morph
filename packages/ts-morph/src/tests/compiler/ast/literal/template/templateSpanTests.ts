import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TemplateSpan } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

function getTemplateSpan(text: string) {
    return getInfoFromTextWithDescendant<TemplateSpan>(text, SyntaxKind.TemplateSpan).descendant;
}

describe(nameof(TemplateSpan), () => {
    const templateHead = "`foo${";
    const templateSpanExpression = "test";
    const templateSpanLiteral = "}abc`";
    const expr = `${templateHead}${templateSpanExpression}${templateSpanLiteral}`;

    describe(nameof<TemplateSpan>(n => n.getLiteral), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getTemplateSpan(text);
            expect(expression.getLiteral().getText()).to.equal(expectedText);
        }

        it("should get the correct template span literal", () => {
            doTest(expr, templateSpanLiteral);
        });
    });
});
