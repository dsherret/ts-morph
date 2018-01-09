import * as ts from "typescript";
import {expect} from "chai";
import {TryStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithTryStatement(text: string) {
    const obj = getInfoFromText(text);
    const tryStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.TryStatement)
    ) as TryStatement;
    return {...obj, tryStatement};
}

describe(nameof(TryStatement), () => {
    const tryBlock = "{ let x = 0; }";
    const catchClause = "catch (x) { console.log(x); }";
    const finallyBlock = "{ let x = 1; }";
    const statement = `try ${tryBlock} ${catchClause} finally ${finallyBlock}`;
    const emptyStatement = `try ${tryBlock}`;
    const {tryStatement} = getInfoFromTextWithTryStatement(statement);
    const {tryStatement: emptyTryStatement} = getInfoFromTextWithTryStatement(emptyStatement);

    describe(nameof<TryStatement>(n => n.getTryBlock), () => {
        it("should get the correct try block", () => {
            expect(tryStatement.getTryBlock().getText()).to.equal(tryBlock);
        });
    });

    describe(nameof<TryStatement>(n => n.getCatchClause), () => {
        it("should get the correct catch clause", () => {
            expect(tryStatement.getCatchClause()!.getText()).to.equal(catchClause);
        });

        it("should get the correct undefined catch clause", () => {
            expect(emptyTryStatement.getCatchClause()).to.be.undefined;
        });
    });

    describe(nameof<TryStatement>(n => n.getCatchClauseOrThrow), () => {
        it("should should return the catch clause", () => {
            expect(tryStatement.getCatchClauseOrThrow().getText()).to.equal(catchClause);
        });

        it("should throw without a catch clause", () => {
            expect(() => emptyTryStatement.getCatchClauseOrThrow()).to.throw();
        });
    });

    describe(nameof<TryStatement>(n => n.getFinallyBlock), () => {
        it("should get the correct finally block", () => {
            expect(tryStatement.getFinallyBlock()!.getText()).to.equal(finallyBlock);
        });

        it("should get the correct undefined finally block", () => {
            expect(emptyTryStatement.getFinallyBlock()).to.be.undefined;
        });
    });

    describe(nameof<TryStatement>(n => n.getFinallyBlockOrThrow), () => {
        it("should should return the finally block", () => {
            expect(tryStatement.getFinallyBlockOrThrow().getText()).to.equal(finallyBlock);
        });

        it("should throw without a finally block", () => {
            expect(() => emptyTryStatement.getFinallyBlockOrThrow()).to.throw();
        });
    });
});
