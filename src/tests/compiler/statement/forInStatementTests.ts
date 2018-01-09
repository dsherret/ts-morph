import * as ts from "typescript";
import {expect} from "chai";
import {ForInStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithForInStatement(text: string) {
    const obj = getInfoFromText(text);
    const forInStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ForInStatement)
    ) as ForInStatement;
    return {...obj, forInStatement};
}

describe(nameof(ForInStatement), () => {
    const expression = "{}";
    const initializer = "x";
    const statement = `for (${initializer} in ${expression}) {}`;
    describe(nameof<ForInStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {forInStatement} = getInfoFromTextWithForInStatement(text);
            expect(forInStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof<ForInStatement>(n => n.getInitializer), () => {
        function doTest(text: string, expectedText: string) {
            const {forInStatement} = getInfoFromTextWithForInStatement(text);
            expect(forInStatement.getInitializer().getText()).to.equal(expectedText);
        }

        it("should get the correct initializer", () => {
            doTest(statement, initializer);
        });
    });
});
