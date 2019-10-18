import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ElementAccessExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithElementAccessExpression(text: string) {
    const info = getInfoFromTextWithDescendant<ElementAccessExpression>(text, SyntaxKind.ElementAccessExpression);
    return { ...info, elementAccessExpression: info.descendant };
}

describe(nameof(ElementAccessExpression), () => {
    const emptyExpr = "x[]";
    const { elementAccessExpression } = getInfoFromTextWithElementAccessExpression("x[1]");
    const { elementAccessExpression: emptyElementAccessExpression } = getInfoFromTextWithElementAccessExpression(emptyExpr);

    describe(nameof<ElementAccessExpression>(n => n.getArgumentExpression), () => {
        it("should get the correct argument expression", () => {
            expect(elementAccessExpression.getArgumentExpression()!.getText()).to.equal("1");
        });

        // seems like this stopped being undefined in ts 2.9
        it.skip("should get the correct undefined argument expression", () => {
            expect(emptyElementAccessExpression.getArgumentExpression()).to.be.undefined;
        });
    });

    describe(nameof<ElementAccessExpression>(n => n.getArgumentExpressionOrThrow), () => {
        it("should should return the argument expression", () => {
            expect(elementAccessExpression.getArgumentExpressionOrThrow().getText()).to.equal("1");
        });

        // seems like this stopped being undefined in ts 2.9
        it.skip("should throw without an argument expression", () => {
            expect(() => emptyElementAccessExpression.getArgumentExpressionOrThrow()).to.throw();
        });
    });
});
