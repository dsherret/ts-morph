import {expect} from "chai";
import {ArgumentedNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ArgumentedNode), () => {
    describe(nameof<ArgumentedNode>(n => n.getArguments), () => {
        function doTest(code: string, expectedArgs: string[]) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(code);
            const args = firstChild.getDecorators()[0].getCallExpression()!.getArguments();
            expect(args.map(a => a.getText())).to.deep.equal(expectedArgs);
        }

        it("should get the arguments when there are none", () => {
            doTest("@decorator()\nclass MyClass {}", []);
        });

        it("should get the arguments when they exist", () => {
            doTest("@decorator(arg1, arg2)\nclass MyClass {}", ["arg1", "arg2"]);
        });
    });
});
