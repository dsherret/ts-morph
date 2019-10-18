import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TaggedTemplateExpression } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

function getExpression(text: string) {
    return getInfoFromTextWithDescendant<TaggedTemplateExpression>(text, SyntaxKind.TaggedTemplateExpression).descendant;
}

describe(nameof(TaggedTemplateExpression), () => {
    describe(nameof<TaggedTemplateExpression>(n => n.getTag), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getTag().getText()).to.equal(expectedText);
        }

        it("should get the correct tag expression", () => {
            doTest("(x + 1)`hello world`", "(x + 1)");
        });
    });

    describe(nameof<TaggedTemplateExpression>(n => n.getTemplate), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            expect(expression.getTemplate().getText()).to.equal(expectedText);
        }

        it("should get the correct template expression", () => {
            doTest("(x + 1)`hello world`", "`hello world`");
        });
    });

    describe(nameof<TaggedTemplateExpression>(n => n.removeTag), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getExpression(text);
            const sourceFile = expression._sourceFile;
            const template = expression.getTemplate();
            const templateText = template.getText();
            expect(expression.removeTag().getText()).to.equal(templateText);
            expect(template.getText()).to.equal(templateText, "should still know about the template");
            expect(sourceFile.getText()).to.equal(expectedText);
        }

        it("should remove the tag when a no substitution template literal", () => {
            doTest("(x + 1)`hello world`", "`hello world`");
        });

        it("should remove the tag when a tagged template", () => {
            doTest("(x + 1)`hello ${world}`", "`hello ${world}`");
        });
    });
});
