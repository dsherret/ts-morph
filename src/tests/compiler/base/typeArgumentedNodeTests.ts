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

    describe(nameof<TypeArgumentedNode>(n => n.removeTypeArgument), () => {
        function doRemoveTypeArgTest(code: string, argIndexToRemove: number, expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
            firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(argIndexToRemove);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should throw when there are no current type arguments", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("@decorator(arg1, arg2)\nclass MyClass {}");
            expect(() => firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(0)).to.throw();
        });

        it("should throw when specifying an out of range index", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("@decorator<MyClass>(arg1, arg2)\nclass MyClass {}");
            expect(() => firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(1)).to.throw();
        });

        it("should remove when specifying the actual type argument", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("@decorator<MyClass>(arg1, arg2)\nclass MyClass {}");
            const callExpression = firstChild.getDecorators()[0].getCallExpression()!;
            const typeArg = callExpression.getTypeArguments()[0];
            callExpression.removeTypeArgument(typeArg);
            expect(sourceFile.getFullText()).to.equal("@decorator(arg1, arg2)\nclass MyClass {}");
        });

        it("should remove when the only type argument", () => {
            doRemoveTypeArgTest("@decorator<MyClass>(arg1, arg2)\nclass MyClass {}", 0,
                "@decorator(arg1, arg2)\nclass MyClass {}");
        });

        it("should remove the first type argument", () => {
            doRemoveTypeArgTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", 0,
                "@decorator<number, {}>(arg1, arg2)\nclass MyClass {}");
        });

        it("should remove the middle type argument", () => {
            doRemoveTypeArgTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", 1,
                "@decorator<string, {}>(arg1, arg2)\nclass MyClass {}");
        });

        it("should remove the last type argument", () => {
            doRemoveTypeArgTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", 2,
                "@decorator<string, number>(arg1, arg2)\nclass MyClass {}");
        });
    });
});
