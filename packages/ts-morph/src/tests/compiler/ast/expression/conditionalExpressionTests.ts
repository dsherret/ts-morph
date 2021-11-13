import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ConditionalExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const info = getInfoFromTextWithDescendant<ConditionalExpression>(text, SyntaxKind.ConditionalExpression);
    return { ...info, expression: info.descendant };
}

describe("ConditionalExpression", () => {
    const condition = "x > 0";
    const questionToken = "?";
    const whenTrue = "0";
    const colonToken = ":";
    const whenFalse = "x";
    const conditional = `${condition} ${questionToken} ${whenTrue} ${colonToken} ${whenFalse}`;
    describe(nameof.property<ConditionalExpression>("getCondition"), () => {
        function doTest(text: string, expectedText: string) {
            const { expression } = getInfoFromTextWithExpression(text);
            expect(expression.getCondition().getText()).to.equal(expectedText);
        }

        it("should get the correct condition", () => {
            doTest(conditional, condition);
        });
    });

    describe(nameof.property<ConditionalExpression>("getQuestionToken"), () => {
        function doTest(text: string, expectedText: string) {
            const { expression } = getInfoFromTextWithExpression(text);
            expect(expression.getQuestionToken().getText()).to.equal(expectedText);
        }

        it("should get the correct question token", () => {
            doTest(conditional, questionToken);
        });
    });

    describe(nameof.property<ConditionalExpression>("getWhenTrue"), () => {
        function doTest(text: string, expectedText: string) {
            const { expression } = getInfoFromTextWithExpression(text);
            expect(expression.getWhenTrue().getText()).to.equal(expectedText);
        }

        it("should get the correct when true", () => {
            doTest(conditional, whenTrue);
        });
    });

    describe(nameof.property<ConditionalExpression>("getColonToken"), () => {
        function doTest(text: string, expectedText: string) {
            const { expression } = getInfoFromTextWithExpression(text);
            expect(expression.getColonToken().getText()).to.equal(expectedText);
        }

        it("should get the correct colon token", () => {
            doTest(conditional, colonToken);
        });
    });

    describe(nameof.property<ConditionalExpression>("getWhenFalse"), () => {
        function doTest(text: string, expectedText: string) {
            const { expression } = getInfoFromTextWithExpression(text);
            expect(expression.getWhenFalse().getText()).to.equal(expectedText);
        }

        it("should get the correct when false", () => {
            doTest(conditional, whenFalse);
        });
    });
});
