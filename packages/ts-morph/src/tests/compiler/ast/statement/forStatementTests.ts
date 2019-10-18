import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ForStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<ForStatement>(text, SyntaxKind.ForStatement).descendant;
}

describe(nameof(ForStatement), () => {
    const initializer = "let x = 0";
    const condition = "x <= 10";
    const incrementor = "x += 1";
    const statement = `for (${initializer}; ${condition}; ${incrementor}) {}`;
    const emptyStatement = "for (;;) {}";
    const forStatement = getStatement(statement);
    const emptyForStatement = getStatement(emptyStatement);

    describe(nameof<ForStatement>(n => n.getInitializer), () => {
        it("should get the correct initializer", () => {
            expect(forStatement.getInitializer()!.getText()).to.equal(initializer);
        });

        it("should get the correct undefined initializer", () => {
            expect(emptyForStatement.getInitializer()).to.be.undefined;
        });
    });

    describe(nameof<ForStatement>(n => n.getInitializerOrThrow), () => {
        it("should should return the initializer", () => {
            expect(forStatement.getInitializerOrThrow().getText()).to.equal(initializer);
        });

        it("should throw without an initializer", () => {
            expect(() => emptyForStatement.getInitializerOrThrow()).to.throw();
        });
    });

    describe(nameof<ForStatement>(n => n.getCondition), () => {
        it("should get the correct condition", () => {
            expect(forStatement.getCondition()!.getText()).to.equal(condition);
        });

        it("should get the correct undefined condition", () => {
            expect(emptyForStatement.getCondition()).to.be.undefined;
        });
    });

    describe(nameof<ForStatement>(n => n.getConditionOrThrow), () => {
        it("should should return the condition", () => {
            expect(forStatement.getConditionOrThrow().getText()).to.equal(condition);
        });

        it("should throw without a condition", () => {
            expect(() => emptyForStatement.getConditionOrThrow()).to.throw();
        });
    });

    describe(nameof<ForStatement>(n => n.getInitializer), () => {
        it("should get the correct incrementor", () => {
            expect(forStatement.getIncrementor()!.getText()).to.equal(incrementor);
        });

        it("should get the correct undefined incrementor", () => {
            expect(emptyForStatement.getIncrementor()).to.be.undefined;
        });
    });

    describe(nameof<ForStatement>(n => n.getIncrementorOrThrow), () => {
        it("should should return the incrementor", () => {
            expect(forStatement.getIncrementorOrThrow().getText()).to.equal(incrementor);
        });

        it("should throw without an incrementor", () => {
            expect(() => emptyForStatement.getIncrementorOrThrow()).to.throw();
        });
    });
});
