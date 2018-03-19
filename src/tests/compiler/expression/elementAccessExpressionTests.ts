import {expect} from "chai";
import {ts, SyntaxKind} from "../../../typescript";
import {ElementAccessExpression} from "../../../compiler";
import {getInfoFromTextWithDescendant} from "../testHelpers";

function getInfoFromTextWithElementAccessExpression(text: string) {
    const info = getInfoFromTextWithDescendant<ElementAccessExpression>(text, SyntaxKind.ElementAccessExpression);
    return {...info, elementAccessExpression: info.descendant};
}

describe(nameof(ElementAccessExpression), () => {
    const expression = "1 + 2";
    const expr = `x[${expression}]`;
    const emptyExpr = "x[]";
    const {elementAccessExpression} = getInfoFromTextWithElementAccessExpression(expr);
    const {elementAccessExpression: emptyElementAccessExpression} = getInfoFromTextWithElementAccessExpression(emptyExpr);

    describe(nameof<ElementAccessExpression>(n => n.getArgumentExpression), () => {
        it("should get the correct argument expression", () => {
            expect(elementAccessExpression.getArgumentExpression()!.getText()).to.equal(expression);
        });

        it("should get the correct undefined argument expression", () => {
            expect(emptyElementAccessExpression.getArgumentExpression()).to.be.undefined;
        });
    });

    describe(nameof<ElementAccessExpression>(n => n.getArgumentExpressionOrThrow), () => {
        it("should should return the argument expression", () => {
            expect(elementAccessExpression.getArgumentExpressionOrThrow().getText()).to.equal(expression);
        });

        it("should throw without an argument expression", () => {
            expect(() => emptyElementAccessExpression.getArgumentExpressionOrThrow()).to.throw();
        });
    });
});
