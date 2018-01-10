import * as ts from "typescript";
import {expect} from "chai";
import {NewExpression, LeftHandSideExpressionedNode} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.NewExpression)
    ) as NewExpression;
    return {...obj, expression};
}

describe(nameof(LeftHandSideExpressionedNode), () => {
    describe(nameof<LeftHandSideExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("new x(y)", "x");
        });
    });
});
