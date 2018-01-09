import * as ts from "typescript";
import {expect} from "chai";
import {DoStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithDoStatement(text: string) {
    const obj = getInfoFromText(text);
    const doStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.DoStatement)
    ) as DoStatement;
    return {...obj, doStatement};
}

describe(nameof(DoStatement), () => {
    const statement = "do {}";
    const expression = "x > 0";
    const expressionStatement = `do {} while (${expression});`;
    describe(nameof<DoStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {doStatement} = getInfoFromTextWithDoStatement(text);
            expect(doStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should have an empty expression without while", () => {
            doTest(statement, "");
        });

        it("should return the correct expression", () => {
            doTest(expressionStatement, expression);
        });
    });
});
