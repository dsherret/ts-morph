import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { DoStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<DoStatement>(text, SyntaxKind.DoStatement).descendant;
}

describe(nameof(DoStatement), () => {
    const statement = "do {}";
    const expression = "x > 0";
    const expressionStatement = `do {} while (${expression});`;

    describe(nameof<DoStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const doStatement = getStatement(text);
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
