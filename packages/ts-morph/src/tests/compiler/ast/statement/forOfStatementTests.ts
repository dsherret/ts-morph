import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ForOfStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<ForOfStatement>(text, SyntaxKind.ForOfStatement).descendant;
}

describe(nameof(ForOfStatement), () => {
    const expression = "{}";
    const initializer = "x";
    const statement = `for (${initializer} of ${expression}) {}`;
    describe(nameof<ForOfStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const forOfStatement = getStatement(text);
            expect(forOfStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof<ForOfStatement>(n => n.getInitializer), () => {
        function doTest(text: string, expectedText: string) {
            const forOfStatement = getStatement(text);
            expect(forOfStatement.getInitializer().getText()).to.equal(expectedText);
        }

        it("should get the correct initializer", () => {
            doTest(statement, initializer);
        });
    });
});
