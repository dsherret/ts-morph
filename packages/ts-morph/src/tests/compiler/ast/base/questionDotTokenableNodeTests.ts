import { expect } from "chai";
import { QuestionDotTokenableNode, ExpressionStatement } from "../../../../compiler";
import { QuestionDotTokenableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(QuestionDotTokenableNode), () => {
    function getInfoWithFirstExpr(text: string) {
        const result = getInfoFromText<ExpressionStatement>(text);
        return { ...result, expr: result.firstChild.getExpression() as any as QuestionDotTokenableNode };
    }

    describe(nameof<QuestionDotTokenableNode>(d => d.hasQuestionDotToken), () => {
        function doTest(text: string, value: boolean) {
            const { expr: firstMember } = getInfoWithFirstExpr(text);
            expect(firstMember.hasQuestionDotToken()).to.equal(value);
        }

        it("should have when has with call expression", () => {
            doTest("callExpr?.()", true);
        });

        it("should have when has with element access expression", () => {
            doTest("elementAccess?.[0]", true);
        });

        it("should have when has with prop access expression", () => {
            doTest("propAccess?.test", true);
        });

        it("should not have when not has one", () => {
            doTest("callExpr()", false);
        });
    });

    describe(nameof<QuestionDotTokenableNode>(d => d.getQuestionDotTokenNode), () => {
        it("should get it", () => {
            const { expr: firstMember } = getInfoWithFirstExpr("call?.()");
            expect(firstMember.getQuestionDotTokenNode()!.getText()).to.equal("?.");
        });

        it("should be undefined when not has one", () => {
            const { expr: firstMember } = getInfoWithFirstExpr("call()");
            expect(firstMember.getQuestionDotTokenNode()).to.be.undefined;
        });
    });

    describe(nameof<QuestionDotTokenableNode>(d => d.getQuestionDotTokenNodeOrThrow), () => {
        it("should get it", () => {
            const { expr: firstMember } = getInfoWithFirstExpr("call?.()");
            expect(firstMember.getQuestionDotTokenNodeOrThrow()!.getText()).to.equal("?.");
        });

        it("should throw when not has one", () => {
            const { expr: firstMember } = getInfoWithFirstExpr("call()");
            expect(() => firstMember.getQuestionDotTokenNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<QuestionDotTokenableNode>(d => d.setHasQuestionDotToken), () => {
        function doTest(startText: string, value: boolean, expected: string) {
            const { expr: firstMember, sourceFile } = getInfoWithFirstExpr(startText);
            firstMember.setHasQuestionDotToken(value);
            expect(sourceFile.getFullText()).to.be.equal(expected);
        }

        it("should be set when not", () => {
            doTest("call()", true, "call?.()");
        });

        it("should be set as not when is", () => {
            doTest("call?.()", false, "call()");
        });

        it("should do nothing when setting to same value", () => {
            doTest("call?.()", true, "call?.()");
        });

        it("should be set when element access", () => {
            doTest("element[0]", true, "element?.[0]");
        });

        it("should remove when element access", () => {
            doTest("element?.[0]", false, "element[0]");
        });

        it("should be set when prop access", () => {
            doTest("prop.test", true, "prop?.test");
        });

        it("should be set when prop access on multiple lines", () => {
            doTest("prop\n    .test", true, "prop\n    ?.test");
        });

        it("should remove when prop access", () => {
            doTest("prop?.test", false, "prop.test");
        });

        it("should remove when prop access on multiple lines", () => {
            doTest("prop\n  ?.test", false, "prop\n  .test");
        });
    });

    // todo: getStructure and set tests (not used right now)
});
