import { expect } from "chai";
import { ClassDeclaration, ExpressionWithTypeArguments } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ExpressionWithTypeArguments), () => {
    function getFirstExpressionWithTypeArgs(text: string) {
        const { firstChild } = getInfoFromText<ClassDeclaration>(text);
        return firstChild.getExtends()!;
    }

    describe(nameof<ExpressionWithTypeArguments>(d => d.getExpression), () => {
        it("should get the compiler expression", () => {
            const expression = getFirstExpressionWithTypeArgs("class MyClass extends MyOtherClass {}");
            expect(expression.getExpression().getText()).to.equal("MyOtherClass");
        });
    });

    describe(nameof<ExpressionWithTypeArguments>(d => d.getTypeArguments), () => {
        it("should return an empty array when there's no type arguments", () => {
            const expression = getFirstExpressionWithTypeArgs("class MyClass extends MyOtherClass {}");
            expect(expression.getTypeArguments().length).to.equal(0);
        });

        describe("having two type arguments", () => {
            const expression = getFirstExpressionWithTypeArgs("class MyClass extends MyOtherClass<string, number> {}");
            const typeArgs = expression.getTypeArguments();

            it("should return the right number of type arguments", () => {
                expect(typeArgs.length).to.equal(2);
            });

            it("should first have a string", () => {
                expect(typeArgs[0].getText()).to.equal("string");
            });

            it("should second have a number", () => {
                expect(typeArgs[1].getText()).to.equal("number");
            });
        });
    });
});
