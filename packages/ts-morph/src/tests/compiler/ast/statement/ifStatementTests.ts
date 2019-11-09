import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { IfStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<IfStatement>(text, SyntaxKind.IfStatement).descendant;
}

describe(nameof(IfStatement), () => {
    const expression = "1 + 2 === 3";
    const thenStatement = "{ x = 1; }";
    const elseStatement = "{ x = 2; }";
    const statement = `if (${expression}) ${thenStatement} else ${elseStatement}`;

    describe(nameof<IfStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const ifStatement = getStatement(text);
            expect(ifStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof<IfStatement>(n => n.getThenStatement), () => {
        function doTest(text: string, expectedText: string) {
            const ifStatement = getStatement(text);
            expect(ifStatement.getThenStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct then statement", () => {
            doTest(statement, thenStatement);
        });
    });

    describe(nameof<IfStatement>(n => n.getElseStatement), () => {
        function doTest(text: string, expectedText: string | undefined) {
            const ifStatement = getStatement(text);
            const value = ifStatement.getElseStatement();
            expect(value?.getText()).to.equal(expectedText);
        }

        it("should get the correct else statement", () => {
            doTest(statement, elseStatement);
        });

        it("should get the correct undefined else statement", () => {
            doTest("if (x) { x = 2 }", undefined);
        });
    });
});
