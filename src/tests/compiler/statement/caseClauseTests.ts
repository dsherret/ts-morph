import * as ts from "typescript";
import {expect} from "chai";
import {CaseClause} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithCaseClause(text: string) {
    const obj = getInfoFromText(text);
    const caseClause = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.CaseClause)
    ) as CaseClause;
    return {...obj, caseClause};
}

describe(nameof(CaseClause), () => {
    const expression = "1";
    const statement = "let x = 1 + 2;";
    const clause = `switch (y) { case ${expression}: ${statement} }`;
    describe(nameof<CaseClause>(n => n.getStatements), () => {
        function doTest(text: string, expectedText: string) {
            const {caseClause} = getInfoFromTextWithCaseClause(text);
            expect(caseClause.getStatements()[0].getText()).to.equal(expectedText);
        }

        it("should get the correct statements", () => {
            doTest(clause, statement);
        });
    });

    describe(nameof<CaseClause>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {caseClause} = getInfoFromTextWithCaseClause(text);
            expect(caseClause.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(clause, expression);
        });
    });
});
