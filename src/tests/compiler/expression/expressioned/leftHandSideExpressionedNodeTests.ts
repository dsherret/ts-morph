import * as ts from "typescript";
import {expect} from "chai";
import {NewExpression, LeftHandSideExpressionedNode} from "./../../../../compiler";
import {getInfoFromTextWithDescendant} from "./../../testHelpers";

describe(nameof(LeftHandSideExpressionedNode), () => {
    describe(nameof<LeftHandSideExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {descendant} = getInfoFromTextWithDescendant<NewExpression>(text, ts.SyntaxKind.NewExpression);
            expect(descendant.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("new x(y)", "x");
        });
    });
});
