import { expect } from "chai";
import { ClassDeclaration, Decorator } from "../../../../compiler";
import { DecoratorStructure, StructureKind } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

describe(nameof(Decorator), () => {
    function getFirstClassDecorator(code: string) {
        const result = getInfoFromText<ClassDeclaration>(code);
        const firstDecorator = result.firstChild.getDecorators()[0];
        return { ...result, firstDecorator };
    }

    describe(nameof<Decorator>(d => d.isDecoratorFactory), () => {
        it("should not be a decorator factory when has no call expression", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(false);
        });

        it("should be a decorator factory when has call expression", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator()\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(true);
        });

        it("should be a decorator factory when has call expression with parameters", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator('str', 23)\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(true);
        });
    });

    describe(nameof<Decorator>(d => d.setIsDecoratorFactory), () => {
        function doSettingTest(startText: string, expectedText: string) {
            const { firstDecorator, sourceFile } = getFirstClassDecorator(startText);
            const expr = firstDecorator.getExpression();
            firstDecorator.setIsDecoratorFactory(true);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(() => expr.getFullText()).to.not.throw(); // should not throw when accessing this moved node
        }

        it("should set as a decorator factory when not one", () => {
            doSettingTest("@decorator\nclass Identifier {}", "@decorator()\nclass Identifier {}");
        });

        it("should set as a decorator factory when not one and is a property access expression", () => {
            doSettingTest("@dec.prop\nclass Identifier {}", "@dec.prop()\nclass Identifier {}");
        });

        function doUnSettingTest(startText: string, expectedText: string) {
            const { firstDecorator, sourceFile } = getFirstClassDecorator(startText);
            const expr = firstDecorator.getCallExpressionOrThrow().getExpression();
            firstDecorator.setIsDecoratorFactory(false);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(() => expr.getFullText()).to.not.throw(); // should not throw when accessing this moved node
        }

        it("should set as not a decorator factory when is one", () => {
            doUnSettingTest("@decorator()\nclass Identifier {}", "@decorator\nclass Identifier {}");
        });

        it("should set as not a decorator factory when is one and is a property access expression", () => {
            doUnSettingTest("@dec.prop()\nclass Identifier {}", "@dec.prop\nclass Identifier {}");
        });
    });

    describe(nameof<Decorator>(d => d.getNameNode), () => {
        function doTest(text: string, expectedName: string) {
            const { firstDecorator } = getFirstClassDecorator(text);
            expect(firstDecorator.getNameNode().getText()).to.equal(expectedName);
        }

        it("should get the name node for a non-decorator factory", () => {
            doTest("@decorator\nclass Identifier {}", "decorator");
        });

        it("should get the name node for a non-decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator\nclass Identifier {}", "decorator");
        });

        it("should get the name node for a decorator factory", () => {
            doTest("@decorator()\nclass Identifier {}", "decorator");
        });

        it("should get the name node for a decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator()\nclass Identifier {}", "decorator");
        });
    });

    describe(nameof<Decorator>(d => d.getName), () => {
        function doTest(text: string, expectedName: string) {
            const { firstDecorator } = getFirstClassDecorator(text);
            expect(firstDecorator.getName()).to.equal(expectedName);
        }

        it("should get the name for a non-decorator factory", () => {
            doTest("@decorator\nclass Identifier {}", "decorator");
        });

        it("should get the name for a non-decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator\nclass Identifier {}", "decorator");
        });

        it("should get the name for a decorator factory", () => {
            doTest("@decorator()\nclass Identifier {}", "decorator");
        });

        it("should get the name for a decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator()\nclass Identifier {}", "decorator");
        });
    });

    describe(nameof<Decorator>(d => d.getFullName), () => {
        function doTest(text: string, expectedName: string) {
            const { firstDecorator } = getFirstClassDecorator(text);
            expect(firstDecorator.getFullName()).to.equal(expectedName);
        }

        it("should get the name for a non-decorator factory", () => {
            doTest("@decorator\nclass Identifier {}", "decorator");
        });

        it("should get the name for a non-decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator\nclass Identifier {}", "namespaceTest.decorator");
        });

        it("should get the name for a decorator factory", () => {
            doTest("@decorator()\nclass Identifier {}", "decorator");
        });

        it("should get the name for a decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator()\nclass Identifier {}", "namespaceTest.decorator");
        });
    });

    describe(nameof<Decorator>(d => d.getCallExpression), () => {
        it("should return undefined when not a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getCallExpression()).to.be.undefined;
        });

        it("should get the compiler call expression when a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator('str', 4)\nclass Identifier {}");
            expect(firstDecorator.getCallExpression()!.getArguments().length).to.equal(2);
        });
    });

    describe(nameof<Decorator>(d => d.getCallExpressionOrThrow), () => {
        it("should return undefined when not a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(() => firstDecorator.getCallExpressionOrThrow()).to.throw();
        });

        it("should get the compiler call expression when a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator('str', 4)\nclass Identifier {}");
            expect(firstDecorator.getCallExpressionOrThrow().getArguments().length).to.equal(2);
        });
    });

    describe(nameof<Decorator>(d => d.getArguments), () => {
        it("should return an empty array when not a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getArguments()).to.deep.equal([]);
        });

        it("should get the arguments when a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator('str', 4)\nclass Identifier {}");
            expect(firstDecorator.getArguments().length).to.equal(2);
        });
    });

    describe(nameof<Decorator>(n => n.insertArguments), () => {
        function doTest(code: string, index: number, texts: (string | WriterFunction)[] | WriterFunction, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const decorator = firstChild.getDecorators()[0];
            const originalLength = decorator.getArguments().length;
            const result = decorator.insertArguments(index, texts);
            const newLength = decorator.getArguments().length;
            expect(result.length).to.equal(newLength - originalLength);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert multiple args when none exist", () => {
            doTest("@dec()\nclass T {}", 0, ["5", "6", writer => writer.write("7")], "@dec(5, 6, 7)\nclass T {}");
        });

        it("should insert with a writer with queued child indentation", () => {
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

        it("should set as decorator factory when not", () => {
            doTest("@dec\nclass T {}", 0, ["1"], "@dec(1)\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.insertArgument), () => {
        function doTest(code: string, index: number, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const result = firstChild.getDecorators()[0].insertArgument(index, text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert an arg", () => {
            doTest("@dec(1, 3)\nclass T {}", 1, "2", "@dec(1, 2, 3)\nclass T {}");
        });

        it("should set as decorator factory when not", () => {
            doTest("@dec\nclass T {}", 0, "1", "@dec(1)\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.addArguments), () => {
        function doTest(code: string, texts: string[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const result = firstChild.getDecorators()[0].addArguments(texts);
            expect(result.map(t => t.getText())).to.deep.equal(texts);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple args", () => {
            doTest("@dec(1)\nclass T {}", ["2", "3"], "@dec(1, 2, 3)\nclass T {}");
        });

        it("should set as decorator factory when not", () => {
            doTest("@dec\nclass T {}", ["1"], "@dec(1)\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.addArgument), () => {
        function doTest(code: string, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const result = firstChild.getDecorators()[0].addArgument(text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add an arg", () => {
            doTest("@dec(1, 2)\nclass T {}", "3", "@dec(1, 2, 3)\nclass T {}");
        });

        it("should set as decorator factory when not", () => {
            doTest("@dec\nclass T {}", "1", "@dec(1)\nclass T {}");
        });
    });

    describe(nameof<Decorator>(d => d.getTypeArguments), () => {
        it("should return an empty array when not a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getTypeArguments()).to.deep.equal([]);
        });

        it("should get the type arguments when a decorator factory", () => {
            const { firstDecorator } = getFirstClassDecorator("@decorator<number, string>()\nclass Identifier {}");
            expect(firstDecorator.getTypeArguments().length).to.equal(2);
        });
    });

    describe(nameof<Decorator>(n => n.insertTypeArguments), () => {
        function doTest(code: string, index: number, texts: string[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const result = firstChild.getDecorators()[0].insertTypeArguments(index, texts);
            expect(result.map(t => t.getText())).to.deep.equal(texts);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        // most of these tests are in typeArgumentedNodeTests
        it("should insert multiple type args when none exist", () => {
            doTest("@dec()\nclass T {}", 0, ["5", "6", "7"], "@dec<5, 6, 7>()\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.insertTypeArgument), () => {
        function doTest(code: string, index: number, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const result = firstChild.getDecorators()[0].insertTypeArgument(index, text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert a type arg", () => {
            doTest("@dec<1, 3>()\nclass T {}", 1, "2", "@dec<1, 2, 3>()\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.addTypeArguments), () => {
        function doTest(code: string, texts: string[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const result = firstChild.getDecorators()[0].addTypeArguments(texts);
            expect(result.map(t => t.getText())).to.deep.equal(texts);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple type args", () => {
            doTest("@dec<1>()\nclass T {}", ["2", "3"], "@dec<1, 2, 3>()\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.addTypeArgument), () => {
        function doTest(code: string, text: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            const result = firstChild.getDecorators()[0].addTypeArgument(text);
            expect(result.getText()).to.equal(text);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add a type arg", () => {
            doTest("@dec<1, 2>()\nclass T {}", "3", "@dec<1, 2, 3>()\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.removeTypeArgument), () => {
        function doRemoveTypeArgTest(code: string, argIndexToRemove: number, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            firstChild.getDecorators()[0].removeTypeArgument(argIndexToRemove);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should throw when not a call expression", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("@decorator\nclass MyClass {}");
            expect(() => firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(0)).to.throw();
        });

        it("should remove when the only type argument", () => {
            doRemoveTypeArgTest("@decorator<MyClass>(arg1, arg2)\nclass MyClass {}", 0, "@decorator(arg1, arg2)\nclass MyClass {}");
        });
    });

    describe(nameof<Decorator>(d => d.remove), () => {
        describe("class decorators", () => {
            function doTest(code: string, index: number, expectedText: string) {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
                firstChild.getDecorators()[index].remove();
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove when it's the only class decorator", () => {
                doTest("@decorator(2, 5, 3)\nclass T {}", 0, "class T {}");
            });

            it("should remove when it's the first class decorator on the same line", () => {
                doTest("@dec1 @dec2 @dec3\nclass T {}", 0, "@dec2 @dec3\nclass T {}");
            });

            it("should remove when it's the middle class decorator on the same line", () => {
                doTest("@dec1 @dec2 @dec3\nclass T {}", 1, "@dec1 @dec3\nclass T {}");
            });

            it("should remove when it's the last class decorator on the same line", () => {
                doTest("@dec1 @dec2 @dec3\nclass T {}", 2, "@dec1 @dec2\nclass T {}");
            });

            it("should remove when it's the first class decorator on different lines", () => {
                doTest("@dec1\n@dec2\n@dec3\nclass T {}", 0, "@dec2\n@dec3\nclass T {}");
            });

            it("should remove when it's the middle class decorator on different lines", () => {
                doTest("@dec1\n@dec2\n@dec3\nclass T {}", 1, "@dec1\n@dec3\nclass T {}");
            });

            it("should remove when it's the last class decorator on different lines", () => {
                doTest("@dec1\n@dec2\n@dec3\nclass T {}", 2, "@dec1\n@dec2\nclass T {}");
            });
        });

        describe("parameter decorators", () => {
            function doTest(code: string, index: number, expectedText: string) {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
                firstChild.getInstanceMethods()[0].getParameters()[0].getDecorators()[index].remove();
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove when it's the only parameter decorator", () => {
                doTest("class T { myMethod(@dec param) {} }", 0, "class T { myMethod(param) {} }");
            });

            it("should remove when it's the first parameter decorator", () => {
                doTest("class T { myMethod(@dec1 @dec2 @dec3 param) {} }", 0, "class T { myMethod(@dec2 @dec3 param) {} }");
            });

            it("should remove when it's the middle parameter decorator", () => {
                doTest("class T { myMethod(@dec1 @dec2 @dec3 param) {} }", 1, "class T { myMethod(@dec1 @dec3 param) {} }");
            });

            it("should remove when it's the last parameter decorator", () => {
                doTest("class T { myMethod(@dec1 @dec2 @dec3 param) {} }", 2, "class T { myMethod(@dec1 @dec2 param) {} }");
            });
        });
    });

    describe(nameof<Decorator>(d => d.removeArgument), () => {
        function doTest(text: string, removeIndex: number, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
            firstChild.getDecorators()[0].removeArgument(removeIndex);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        // most of these tests are in argumentedNodeTests
        it("should throw when removing and none exist", () => {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("@test()\nclass T {}");
            expect(() => firstChild.getDecorators()[0].removeArgument(0)).to.throw();
        });

        it("should remove a decorator argument", () => {
            doTest("@test(1, 2, 3)\nclass T {}", 2, "@test(1, 2)\nclass T {}");
        });
    });

    describe(nameof<Decorator>(n => n.set), () => {
        function doTest(text: string, structure: Partial<DecoratorStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText<ClassDeclaration>(text);
            sourceFile.getClasses()[0].getDecorators()[0].set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should not change anything when nothing's set", () => {
            const code = "@dec class T {}";
            doTest(code, {}, code);
        });

        it("should set the name without renaming the decorator", () => {
            const code = (name: string) => `function dec(target: Object) {} @${name} class Test {}`;
            doTest(code("dec"), { name: "newDec" }, code("newDec"));
        });

        it("should make as decorator factory when specifying an empty array of arguments", () => {
            doTest("@dec class T {}", { arguments: [] }, "@dec() class T {}");
        });

        it("should not make as decorator factory when specifying an empty array of type arguments", () => {
            const code = "@dec class T {}";
            doTest(code, { typeArguments: [] }, code);
        });

        it("should set everything when specifying", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<DecoratorStructure>> = {
                name: "NewName",
                arguments: ["1"],
                typeArguments: ["T"]
            };
            doTest("@dec class T {}", structure, "@NewName<T>(1) class T {}");
        });
    });

    describe(nameof<Decorator>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<DecoratorStructure>>) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(text);
            const structure = firstChild.getDecorators()[0].getStructure();
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get when has nothing", () => {
            doTest("@dec class T {}", {
                kind: StructureKind.Decorator,
                name: "dec",
                arguments: undefined,
                typeArguments: undefined
            });
        });

        it("should get when has everything", () => {
            doTest("@dec<T>(test) class T {}", {
                kind: StructureKind.Decorator,
                name: "dec",
                arguments: ["test"],
                typeArguments: ["T"]
            });
        });
    });
});
