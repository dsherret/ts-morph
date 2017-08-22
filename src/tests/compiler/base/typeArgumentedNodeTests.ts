import {expect} from "chai";
import {TypeArgumentedNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypeArgumentedNode), () => {
    describe(nameof<TypeArgumentedNode>(n => n.getTypeArguments), () => {
        function doTest(code: string, expectedArgs: string[]) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(code);
            const args = firstChild.getDecorators()[0].getCallExpression()!.getTypeArguments();
            expect(args.map(a => a.getText())).to.deep.equal(expectedArgs);
        }

        it("should get the type arguments when there are none", () => {
            doTest("@decorator()\nclass MyClass {}", []);
        });

        it("should get the type arguments when they exist", () => {
            doTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", ["string", "number", "{}"]);
        });
    });
});
