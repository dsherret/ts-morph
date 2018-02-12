import {expect} from "chai";
import {ts, SyntaxKind} from "./../../../../typescript";
import {TaggedTemplateExpression} from "./../../../../compiler";
import {getInfoFromTextWithDescendant} from "./../../testHelpers";

function getExpression(text: string) {
    return getInfoFromTextWithDescendant<TaggedTemplateExpression>(text, SyntaxKind.TaggedTemplateExpression).descendant;
}

describe(nameof(TaggedTemplateExpression), () => {
    const tag = "(x + 1)";
    const template = "`hello world`";
    const expr = `${tag}${template}`;
    describe(nameof<TaggedTemplateExpression>(n => n.getTag), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getTag().getText()).to.equal(expectedText);
        }

        it("should get the correct tag expression", () => {
            doTest(expr, tag);
        });
    });

    describe(nameof<TaggedTemplateExpression>(n => n.getTemplate), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getTemplate().getText()).to.equal(expectedText);
        }

        it("should get the correct template expression", () => {
            doTest(expr, template);
        });
    });
});
