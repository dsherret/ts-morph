import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CatchClause } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getCatchClause(text: string) {
    return getInfoFromTextWithDescendant<CatchClause>(text, SyntaxKind.CatchClause).descendant;
}

describe(nameof(CatchClause), () => {
    const block = "{ let x = 0; }";
    const variableDeclaration = "x";
    const statement = `catch (${variableDeclaration}) ${block}`;
    const emptyStatement = `catch ${block}`;
    const catchClause = getCatchClause(statement);
    const emptyCatchClause = getCatchClause(emptyStatement);

    describe(nameof<CatchClause>(n => n.getBlock), () => {
        it("should get the correct block", () => {
            expect(catchClause.getBlock().getText()).to.equal(block);
        });
    });

    describe(nameof<CatchClause>(n => n.getVariableDeclaration), () => {
        it("should get the correct variable declaration", () => {
            expect(catchClause.getVariableDeclaration()!.getText()).to.equal(variableDeclaration);
        });

        it("should get the correct undefined variable declaration", () => {
            expect(emptyCatchClause.getVariableDeclaration()).to.be.undefined;
        });
    });

    describe(nameof<CatchClause>(n => n.getVariableDeclarationOrThrow), () => {
        it("should should return the variable declaration", () => {
            expect(catchClause.getVariableDeclarationOrThrow().getText()).to.equal(variableDeclaration);
        });

        it("should throw without a variable declaration", () => {
            expect(() => emptyCatchClause.getVariableDeclarationOrThrow()).to.throw();
        });
    });
});
