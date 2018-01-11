import * as ts from "typescript";
import {expect} from "chai";
import {TaggedTemplateExpression} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.TaggedTemplateExpression)
    ) as TaggedTemplateExpression;
    return {...obj, expression};
}

describe(nameof(TaggedTemplateExpression), () => {
    const tag = "(x + 1)";
    const template = "`hello world`";
    const expr = `${tag}${template}`;
    describe(nameof<TaggedTemplateExpression>(n => n.getTag), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getTag().getText()).to.equal(expectedText);
        }

        it("should get the correct tag expression", () => {
            doTest(expr, tag);
        });
    });

    describe(nameof<TaggedTemplateExpression>(n => n.getTemplate), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getTemplate().getText()).to.equal(expectedText);
        }

        it("should get the correct template expression", () => {
            doTest(expr, template);
        });
    });
});
