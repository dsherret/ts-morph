import * as ts from "typescript";
import {expect} from "chai";
import {ParenthesizedExpression, ExpressionedNode} from "./../../../../compiler";
import {getInfoFromTextWithDescendant} from "./../../testHelpers";

describe(nameof(ExpressionedNode), () => {
    describe(nameof<ExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {descendant} = getInfoFromTextWithDescendant<ParenthesizedExpression>(text, ts.SyntaxKind.ParenthesizedExpression);
            expect(descendant.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("(x + 1)", "x + 1");
        });
    });
});
