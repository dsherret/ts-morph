import * as ts from "typescript";
import {expect} from "chai";
import {WhileStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithWhileStatement(text: string) {
    const obj = getInfoFromText(text);
    const whileStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.WhileStatement)
    ) as WhileStatement;
    return {...obj, whileStatement};
}

describe(nameof(WhileStatement), () => {
    const expression = "x <= 10";
    const statement = `while (${expression}) {}`;

    describe(nameof<WhileStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText?: string) {
            const {whileStatement} = getInfoFromTextWithWhileStatement(text);
            expect(whileStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });
});
