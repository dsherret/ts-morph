import * as ts from "typescript";
import {expect} from "chai";
import {ThrowStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithThrowStatement(text: string) {
    const obj = getInfoFromText(text);
    const doStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ThrowStatement)
    ) as ThrowStatement;
    return {...obj, doStatement};
}

describe(nameof(ThrowStatement), () => {
    const expression = "new Error('foo')";
    const statement = `throw ${expression};`;
    describe(nameof<ThrowStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {doStatement} = getInfoFromTextWithThrowStatement(text);
            expect(doStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should return the correct expression", () => {
            doTest(statement, expression);
        });
    });
});
