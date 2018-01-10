import * as ts from "typescript";
import {expect} from "chai";
import {SwitchStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithSwitchStatement(text: string) {
    const obj = getInfoFromText(text);
    const labeledStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.SwitchStatement)
    ) as SwitchStatement;
    return {...obj, labeledStatement};
}

describe(nameof(SwitchStatement), () => {
    const expression = "x + 1";
    const caseBlock = "{\n  case:\n    break;\n}";
    const statement = `switch (${expression}) ${caseBlock}`;
    describe(nameof<SwitchStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {labeledStatement} = getInfoFromTextWithSwitchStatement(text);
            expect(labeledStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof<SwitchStatement>(n => n.getCaseBlock), () => {
        function doTest(text: string, expectedText: string) {
            const {labeledStatement} = getInfoFromTextWithSwitchStatement(text);
            expect(labeledStatement.getCaseBlock().getText()).to.equal(expectedText);
        }

        it("should get the correct case block", () => {
            doTest(statement, caseBlock);
        });
    });
});
