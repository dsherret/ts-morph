import * as ts from "typescript";
import {expect} from "chai";
import {PostfixUnaryExpression} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithPostfixUnaryExpression(text: string) {
    const obj = getInfoFromText(text);
    const postfixUnaryExpression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.PostfixUnaryExpression)
    ) as PostfixUnaryExpression;
    return {...obj, postfixUnaryExpression};
}

describe(nameof(PostfixUnaryExpression), () => {
    const expression = "x";
    const expr = `${expression}++`;
    const {postfixUnaryExpression} = getInfoFromTextWithPostfixUnaryExpression(expr);

    describe(nameof<PostfixUnaryExpression>(n => n.getOperand), () => {
        it("should get the correct expression", () => {
            expect(postfixUnaryExpression.getOperand()!.getText()).to.equal(expression);
        });
    });

    describe(nameof<PostfixUnaryExpression>(n => n.getOperatorToken), () => {
        it("should return the operator token", () => {
            expect(postfixUnaryExpression.getOperatorToken()).to.equal(ts.SyntaxKind.PlusPlusToken);
        });
    });
});
