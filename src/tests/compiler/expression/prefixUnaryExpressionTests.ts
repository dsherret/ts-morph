import * as ts from "typescript";
import {expect} from "chai";
import {PrefixUnaryExpression} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithPrefixUnaryExpression(text: string) {
    const obj = getInfoFromText(text);
    const prefixUnaryExpression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.PrefixUnaryExpression)
    ) as PrefixUnaryExpression;
    return {...obj, prefixUnaryExpression};
}

describe(nameof(PrefixUnaryExpression), () => {
    const expression = "x";
    const expr = `++${expression}`;
    const {prefixUnaryExpression} = getInfoFromTextWithPrefixUnaryExpression(expr);

    describe(nameof<PrefixUnaryExpression>(n => n.getOperand), () => {
        it("should get the correct expression", () => {
            expect(prefixUnaryExpression.getOperand()!.getText()).to.equal(expression);
        });
    });

    describe(nameof<PrefixUnaryExpression>(n => n.getOperatorToken), () => {
        it("should return the operator token", () => {
            expect(prefixUnaryExpression.getOperatorToken()).to.equal(ts.SyntaxKind.PlusPlusToken);
        });
    });
});
