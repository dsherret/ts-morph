import {expect} from "chai";
import {TypeNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypeNode), () => {
    describe(nameof<TypeNode>(n => n.remove), () => {
        function doRemoveTypeArgTest(code: string, argIndexToRemove: number, expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);

            firstChild.getDecorators()[0].getCallExpression()!.getTypeArguments()[argIndexToRemove].remove();

            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

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
