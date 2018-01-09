import * as ts from "typescript";
import {expect} from "chai";
import {IterationStatement, ForInStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithForInStatement(text: string) {
    const obj = getInfoFromText(text);
    const forInStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ForInStatement)
    ) as ForInStatement;
    return {...obj, forInStatement};
}

describe(nameof(IterationStatement), () => {
    const statement = "{}";
    const iterationStatement = `for (x in {}) ${statement}`;
    describe(nameof<IterationStatement>(n => n.getStatement), () => {
        function doTest(text: string, expectedText: string) {
            const {forInStatement} = getInfoFromTextWithForInStatement(text);
            expect(forInStatement.getStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest(iterationStatement, statement);
        });
    });
});
