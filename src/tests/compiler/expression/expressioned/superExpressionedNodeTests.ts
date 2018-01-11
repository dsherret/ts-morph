import * as ts from "typescript";
import {expect} from "chai";
import {PropertyAccessExpression, SuperExpressionedNode} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.PropertyAccessExpression)
    ) as PropertyAccessExpression;
    return {...obj, expression};
}

describe(nameof(SuperExpressionedNode), () => {
    describe(nameof<SuperExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("super.x", "super");
        });
    });
});
