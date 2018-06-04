import { expect } from "chai";
import { CaseClause } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getCaseClause(text: string) {
    return getInfoFromTextWithDescendant<CaseClause>(text, SyntaxKind.CaseClause).descendant;
}

describe(nameof(CaseClause), () => {
    const expression = "1";
    const statement = "let x = 1 + 2;";
    const clause = `switch (y) { case ${expression}: ${statement} }`;
    describe(nameof<CaseClause>(n => n.getStatements), () => {
        function doTest(text: string, expectedText: string) {
            const caseClause = getCaseClause(text);
            expect(caseClause.getStatements()[0].getText()).to.equal(expectedText);
        }

        it("should get the correct statements", () => {
            doTest(clause, statement);
        });
    });

    describe(nameof<CaseClause>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const caseClause = getCaseClause(text);
            expect(caseClause.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(clause, expression);
        });
    });
});
