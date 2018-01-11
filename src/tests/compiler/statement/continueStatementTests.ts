import * as ts from "typescript";
import {expect} from "chai";
import {ContinueStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithContinueStatement(text: string) {
    const obj = getInfoFromText(text);
    const continueStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ContinueStatement)
    ) as ContinueStatement;
    return {...obj, continueStatement};
}

describe(nameof(ContinueStatement), () => {
    const label = "foo";
    const statement = `continue ${label};`;
    const emptyStatement = "continue;";
    describe(nameof<ContinueStatement>(n => n.getLabel), () => {
        function doTest(text: string, expectedText?: string) {
            const {continueStatement} = getInfoFromTextWithContinueStatement(text);
            const value = continueStatement.getLabel();
            expect(value == null ? value : value.getText()).to.equal(expectedText);
        }

        it("should get the correct label", () => {
            doTest(statement, label);
        });

        it("should get the correct undefined label", () => {
            doTest(emptyStatement, undefined);
        });
    });

    describe(nameof<ContinueStatement>(n => n.getLabelOrThrow), () => {
        function doTest(text: string, expectedText?: string) {
            const {continueStatement} = getInfoFromTextWithContinueStatement(text);
            if (expectedText == null) {
                expect(() => continueStatement.getLabelOrThrow()).to.throw();
            } else {
                expect(continueStatement.getLabelOrThrow().getText()).to.equal(expectedText);
            }
        }

        it("should get the correct label", () => {
            doTest(statement, label);
        });

        it("should throw if label does not exist", () => {
            doTest(emptyStatement, undefined);
        });
    });
});
