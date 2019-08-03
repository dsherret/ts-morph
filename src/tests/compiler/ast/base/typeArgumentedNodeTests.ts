import { expect } from "chai";
import { ClassDeclaration, TypeArgumentedNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(TypeArgumentedNode), () => {
    describe(nameof<TypeArgumentedNode>(n => n.getTypeArguments), () => {
        function doTest(code: string, expectedArgs: string[]) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
            const args = firstChild.getDecorators()[0].getCallExpressionOrThrow().getTypeArguments();
            expect(args.map(a => a.getText())).to.deep.equal(expectedArgs);
        }

        it("should get the type arguments when there are none", () => {
            doTest("@decorator()\nclass MyClass {}", []);
        });

        it("should get the type arguments when they exist", () => {
            doTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", ["string", "number", "{}"]);
        });
    });

    describe(nameof<TypeArgumentedNode>(n => n.insertTypeArguments), () => {
        function doTest(code: string, index: number, texts: string[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const result = callExpr.insertTypeArguments(index, texts);
            expect(result.map(t => t.getText())).to.deep.equal(texts);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert multiple type args when none exist", () => {
            doTest("@dec()\nclass T {}", 0, ["5", "6", "7"], "@dec<5, 6, 7>()\nclass T {}");
        });

        it("should insert multiple type args at the beginning", () => {
            doTest("@dec<3>()\nclass T {}", 0, ["1", "2"], "@dec<1, 2, 3>()\nclass T {}");
        });

        it("should insert multiple type args in the middle", () => {
            doTest("@dec<1, 4>()\nclass T {}", 1, ["2", "3"], "@dec<1, 2, 3, 4>()\nclass T {}");
        });

        it("should insert multiple type args at the end", () => {
            doTest("@dec<1>()\nclass T {}", 1, ["2", "3"], "@dec<1, 2, 3>()\nclass T {}");
        });
    });

    describe(nameof<TypeArgumentedNode>(n => n.insertTypeArgument), () => {
        function doTest(code: string, index: number, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const result = callExpr.insertTypeArgument(index, text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert a type arg", () => {
            doTest("@dec<1, 3>()\nclass T {}", 1, "2", "@dec<1, 2, 3>()\nclass T {}");
        });
    });

    describe(nameof<TypeArgumentedNode>(n => n.addTypeArguments), () => {
        function doTest(code: string, texts: string[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const result = callExpr.addTypeArguments(texts);
            expect(result.map(t => t.getText())).to.deep.equal(texts);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple type args", () => {
            doTest("@dec<1>()\nclass T {}", ["2", "3"], "@dec<1, 2, 3>()\nclass T {}");
        });
    });

    describe(nameof<TypeArgumentedNode>(n => n.addTypeArgument), () => {
        function doTest(code: string, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const result = callExpr.addTypeArgument(text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add a type arg", () => {
            doTest("@dec<1, 2>()\nclass T {}", "3", "@dec<1, 2, 3>()\nclass T {}");
        });
    });

    describe(nameof<TypeArgumentedNode>(n => n.removeTypeArgument), () => {
        it("should throw when there are no current type arguments", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("@decorator(arg1, arg2)\nclass MyClass {}");
            expect(() => firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(0)).to.throw();
        });

        it("should throw when specifying an out of range index", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("@decorator<MyClass>(arg1, arg2)\nclass MyClass {}");
            expect(() => firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(1)).to.throw();
        });

        describe("index", () => {
            function doTest(code: string, argIndexToRemove: number, expectedText: string) {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
                firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(argIndexToRemove);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove when the only type argument", () => {
                doTest("@decorator<MyClass>(arg1, arg2)\nclass MyClass {}", 0, "@decorator(arg1, arg2)\nclass MyClass {}");
            });

            it("should remove the first type argument", () => {
                doTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", 0, "@decorator<number, {}>(arg1, arg2)\nclass MyClass {}");
            });

            it("should remove the middle type argument", () => {
                doTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", 1, "@decorator<string, {}>(arg1, arg2)\nclass MyClass {}");
            });

            it("should remove the last type argument", () => {
                doTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", 2, "@decorator<string, number>(arg1, arg2)\nclass MyClass {}");
            });
        });

        describe("element", () => {
            function doTest(code: string, argIndexToRemove: number, expectedText: string) {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
                const callExpr = firstChild.getDecorators()[0].getCallExpression()!;
                callExpr.removeTypeArgument(callExpr.getTypeArguments()[argIndexToRemove]);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove the specified type argument", () => {
                doTest("@decorator<string, number, {}>(arg1, arg2)\nclass MyClass {}", 1, "@decorator<string, {}>(arg1, arg2)\nclass MyClass {}");
            });
        });
    });
});
