import { expect } from "chai";
import { ArgumentedNode, ClassDeclaration } from "../../../../compiler";
import { WriterFunction } from "../../../../types";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ArgumentedNode), () => {
    describe(nameof<ArgumentedNode>(n => n.getArguments), () => {
        function doTest(code: string, expectedArgs: string[]) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
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

    describe(nameof<ArgumentedNode>(n => n.insertArguments), () => {
        function doTest(code: string, index: number, texts: (string | WriterFunction)[] | WriterFunction, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const originalCount = callExpr.getArguments().length;
            const result = callExpr.insertArguments(index, texts);
            const newCount = callExpr.getArguments().length;
            expect(result.length).to.equal(newCount - originalCount);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert multiple args when none exist", () => {
            doTest("@dec()\nclass T {}", 0, ["5", "6", writer => writer.write("7")], "@dec(5, 6, 7)\nclass T {}");
        });

        it("should write with a writer and use queued child identation", () => {
            doTest("@dec()\nclass T {}", 0, writer => writer.writeLine("5,").write("6"), "@dec(5,\n    6)\nclass T {}");
        });

        it("should insert multiple args at the beginning", () => {
            doTest("@dec(3)\nclass T {}", 0, ["1", "2"], "@dec(1, 2, 3)\nclass T {}");
        });

        it("should insert multiple args in the middle", () => {
            doTest("@dec(1, 4)\nclass T {}", 1, ["2", "3"], "@dec(1, 2, 3, 4)\nclass T {}");
        });

        it("should insert multiple args at the end", () => {
            doTest("@dec(1)\nclass T {}", 1, ["2", "3"], "@dec(1, 2, 3)\nclass T {}");
        });

        it("should insert args when a type argument exists", () => {
            doTest("@dec<3>(1)\nclass T {}", 1, ["2", "3"], "@dec<3>(1, 2, 3)\nclass T {}");
        });

        it("should insert with a writer", () => {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("@dec()\nclass T {}");
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            callExpr.insertArguments(0, [writer => writer.write("5"), writer => writer.write("6")]);
            expect(sourceFile.getFullText()).to.equal("@dec(5, 6)\nclass T {}");
        });
    });

    describe(nameof<ArgumentedNode>(n => n.insertArgument), () => {
        function doTest(code: string, index: number, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const result = callExpr.insertArgument(index, text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert an arg", () => {
            doTest("@dec(1, 3)\nclass T {}", 1, "2", "@dec(1, 2, 3)\nclass T {}");
        });
    });

    describe(nameof<ArgumentedNode>(n => n.addArguments), () => {
        function doTest(code: string, texts: string[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const result = callExpr.addArguments(texts);
            expect(result.map(t => t.getText())).to.deep.equal(texts);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple args", () => {
            doTest("@dec(1)\nclass T {}", ["2", "3"], "@dec(1, 2, 3)\nclass T {}");
        });
    });

    describe(nameof<ArgumentedNode>(n => n.addArgument), () => {
        function doTest(code: string, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const callExpr = firstChild.getDecorators()[0].getCallExpressionOrThrow();
            const result = callExpr.addArgument(text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add an arg", () => {
            doTest("@dec(1, 2)\nclass T {}", "3", "@dec(1, 2, 3)\nclass T {}");
        });
    });

    describe(nameof<ArgumentedNode>(d => d.removeArgument), () => {
        function doTest(text: string, removeIndex: number, expectedText: string) {
            doTestByIndex();
            doTestByArg();

            function doTestByIndex() {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
                firstChild.getDecorators()[0].getCallExpressionOrThrow().removeArgument(removeIndex);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            function doTestByArg() {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
                firstChild.getDecorators()[0].getCallExpressionOrThrow().removeArgument(firstChild.getDecorators()[0].getArguments()[removeIndex]);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }
        }

        it("should throw when specifying an invalid index", () => {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("@test(1, 2, 3)\nclass T {}");
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
