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

    describe(nameof<ArgumentedNode>(d => d.removeArgument), () => {
        function doTest(text: string, removeIndex: number, expectedText: string) {
            doTestByIndex();
            doTestByArg();

            function doTestByIndex() {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(text);
                firstChild.getDecorators()[0].getCallExpressionOrThrow().removeArgument(removeIndex);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            function doTestByArg() {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(text);
                firstChild.getDecorators()[0].getCallExpressionOrThrow().removeArgument(firstChild.getDecorators()[0].getArguments()[removeIndex]);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }
        }

        it("should throw when specifying an invalid index", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("@test(1, 2, 3)\nclass T {}");
            expect(() => firstChild.getDecorators()[0].getCallExpressionOrThrow().removeArgument(3)).to.throw();
        });

        it("should remove a decorator argument when there's only one", () => {
            doTest("@test(1)\nclass T {}", 0, "@test()\nclass T {}");
        });

        it("should remove a decorator argument at the start", () => {
            doTest("@test(1, 2, 3)\nclass T {}", 0, "@test(2, 3)\nclass T {}");
        });

        it("should remove a decorator argument in the middle", () => {
            doTest("@test(1, 2, 3)\nclass T {}", 1, "@test(1, 3)\nclass T {}");
        });

        it("should remove a decorator argument at the end", () => {
            doTest("@test(1, 2, 3)\nclass T {}", 2, "@test(1, 2)\nclass T {}");
        });
    });
});
