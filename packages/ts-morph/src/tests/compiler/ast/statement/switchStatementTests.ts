import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { SwitchStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<SwitchStatement>(text, SyntaxKind.SwitchStatement).descendant;
}

describe(nameof(SwitchStatement), () => {
    const expression = "x + 1";
    const clause = "case 5:\n    break;";
    const caseBlock = `{\n  ${clause}\n}`;
    const statement = `switch (${expression}) ${caseBlock}`;

    describe(nameof<SwitchStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const labeledStatement = getStatement(text);
            expect(labeledStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof<SwitchStatement>(n => n.getCaseBlock), () => {
        function doTest(text: string, expectedText: string) {
            const labeledStatement = getStatement(text);
            expect(labeledStatement.getCaseBlock().getText()).to.equal(expectedText);
        }

        it("should get the correct case block", () => {
            doTest(statement, caseBlock);
        });
    });

    describe(nameof<SwitchStatement>(n => n.getClauses), () => {
        function doTest(code: string, clauses: string[]) {
            const labeledStatement = getStatement(code);
            expect(labeledStatement.getClauses().map(s => s.getText())).to.deep.equal(clauses);
        }

        it("should get clauses of a case block", () => {
            doTest(statement, [clause]);
        });
    });

    describe(nameof<SwitchStatement>(n => n.removeClause), () => {
        function doTest(code: string, index: number, expectedCode: string) {
            const labeledStatement = getStatement(code);
            const sourceFile = labeledStatement.getSourceFile();
            labeledStatement.removeClause(index);
            expect(sourceFile.getFullText()).to.deep.equal(expectedCode);
        }

        // most of the tests are in caseBlockTests
        it("should remove the clause", () => {
            doTest("switch (1) { case: 1: return 5; }", 0, "switch (1) { }");
        });
    });

    describe(nameof<SwitchStatement>(n => n.removeClauses), () => {
        function doTest(code: string, range: [number, number], expectedCode: string) {
            const labeledStatement = getStatement(code);
            const sourceFile = labeledStatement.getSourceFile();
            labeledStatement.removeClauses(range);
            expect(sourceFile.getFullText()).to.deep.equal(expectedCode);
        }

        // most of the tests are in caseBlockTests
        it("should remove the clause", () => {
            doTest("switch (1) { case: 1: case 2: case 3: return 5; }", [0, 1], "switch (1) { case 3: return 5; }");
        });
    });
});
