import * as ts from "typescript";
import {expect} from "chai";
import {ArrowFunction} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ArrowFunction)
    ) as ArrowFunction;
    return {...obj, expression};
}

describe(nameof(ArrowFunction), () => {
    describe(nameof<ArrowFunction>(n => n.getEqualsGreaterThan), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getEqualsGreaterThan().getText()).to.equal(expectedText);
        }

        it("should get the correct equals greater than token", () => {
            doTest("(x) => {}", "=>");
        });
    });
});
