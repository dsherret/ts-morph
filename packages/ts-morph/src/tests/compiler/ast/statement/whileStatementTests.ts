import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { WhileStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<WhileStatement>(text, SyntaxKind.WhileStatement).descendant;
}

describe(nameof(WhileStatement), () => {
    const expression = "x <= 10";
    const statement = `while (${expression}) {}`;

    describe(nameof<WhileStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText?: string) {
            const whileStatement = getStatement(text);
            expect(whileStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });
});
