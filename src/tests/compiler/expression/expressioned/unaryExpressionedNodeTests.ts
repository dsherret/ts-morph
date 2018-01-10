import * as ts from "typescript";
import {expect} from "chai";
import {AwaitExpression, UnaryExpressionedNode} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.AwaitExpression)
    ) as AwaitExpression;
    return {...obj, expression};
}

describe(nameof(UnaryExpressionedNode), () => {
    describe(nameof<UnaryExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("await x;", "x");
        });
    });
});
