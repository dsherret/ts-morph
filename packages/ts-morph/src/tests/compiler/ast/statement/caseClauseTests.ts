import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CaseClause } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getCaseClause(text: string) {
    return getInfoFromTextWithDescendant<CaseClause>(text, SyntaxKind.CaseClause).descendant;
}

describe(nameof(CaseClause), () => {
    describe(nameof<CaseClause>(n => n.getStatementsWithComments), () => {
        function doTest(text: string, expectedTexts: string[]) {
            const caseClause = getCaseClause(text);
            expect(caseClause.getStatementsWithComments().map(s => s.getText())).to.deep.equal(expectedTexts);
        }

        it("should get the statements", () => {
            doTest("switch (y) {\n  case 5:\n    let x = 1;\n    //a\n}", ["let x = 1;", "//a"]);
        });
    });

    describe(nameof<CaseClause>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const caseClause = getCaseClause(text);
            expect(caseClause.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the expression", () => {
            doTest("switch (y) { case 5: let x = 1; }", "5");
        });
    });
});
