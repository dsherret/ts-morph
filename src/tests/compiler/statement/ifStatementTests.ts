import * as ts from "typescript";
import {expect} from "chai";
import {IfStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithIfStatement(text: string) {
    const obj = getInfoFromText(text);
    const ifStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.IfStatement)
    ) as IfStatement;
    return {...obj, ifStatement};
}

describe(nameof(IfStatement), () => {
    const expression = "1 + 2 === 3";
    const thenStatement = "{ x = 1; }";
    const elseStatement = "{ x = 2; }";
    const statement = `if (${expression}) ${thenStatement} else ${elseStatement}`;
    describe(nameof<IfStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {ifStatement} = getInfoFromTextWithIfStatement(text);
            expect(ifStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof<IfStatement>(n => n.getThenStatement), () => {
        function doTest(text: string, expectedText: string) {
            const {ifStatement} = getInfoFromTextWithIfStatement(text);
            expect(ifStatement.getThenStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct then statement", () => {
            doTest(statement, thenStatement);
        });
    });

    describe(nameof<IfStatement>(n => n.getElseStatement), () => {
        function doTest(text: string, expectedText: string | null) {
            const {ifStatement} = getInfoFromTextWithIfStatement(text);
            const value = ifStatement.getElseStatement();
            expect(value == null ? value : value.getText()).to.equal(expectedText);
        }

        it("should get the correct else statement", () => {
            doTest(statement, elseStatement);
        });

        it("should get the correct null else statement", () => {
            doTest("if (x) { x = 2 }", null);
        });
    });
});
