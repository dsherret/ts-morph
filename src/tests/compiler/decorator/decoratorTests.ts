import {expect} from "chai";
import {Decorator, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Decorator), () => {
    function getFirstClassDecorator(code: string) {
        const result = getInfoFromText<ClassDeclaration>(code);
        const firstDecorator = result.firstChild.getDecorators()[0];
        return {...result, firstDecorator};
    }

    describe(nameof<Decorator>(d => d.isDecoratorFactory), () => {
        it("should not be a decorator factory when has no call expression", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(false);
        });

        it("should be a decorator factory when has call expression", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator()\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(true);
        });

        it("should be a decorator factory when has call expression with parameters", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator('str', 23)\nclass Identifier {}");
            expect(firstDecorator.isDecoratorFactory()).to.equal(true);
        });
    });

    describe(nameof<Decorator>(d => d.getNameIdentifier), () => {
        function doTest(text: string, expectedName: string) {
            const {firstDecorator} = getFirstClassDecorator(text);
            expect(firstDecorator.getNameIdentifier().getText()).to.equal(expectedName);
        }

        it("should get the name identifier for a non-decorator factory", () => {
            doTest("@decorator\nclass Identifier {}", "decorator");
        });

        it("should get the name identifier for a non-decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator\nclass Identifier {}", "decorator");
        });

        it("should get the name identifier for a decorator factory", () => {
            doTest("@decorator()\nclass Identifier {}", "decorator");
        });

        it("should get the name identifier for a decorator factory decorator with a namespace", () => {
            doTest("@namespaceTest.decorator()\nclass Identifier {}", "decorator");
        });
    });

    describe(nameof<Decorator>(d => d.getName), () => {
        function doTest(text: string, expectedName: string) {
            const {firstDecorator} = getFirstClassDecorator(text);
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
            const {firstDecorator} = getFirstClassDecorator(text);
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
            const {firstDecorator} = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getCallExpression()).to.be.undefined;
        });

        it("should get the compiler call expression when a decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator('str', 4)\nclass Identifier {}");
            expect(firstDecorator.getCallExpression()!.getArguments().length).to.equal(2);
        });
    });

    describe(nameof<Decorator>(d => d.getArguments), () => {
        it("should return an empty array when not a decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getArguments()).to.deep.equal([]);
        });

        it("should get the arguments when a decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator('str', 4)\nclass Identifier {}");
            expect(firstDecorator.getArguments().length).to.equal(2);
        });
    });

    describe(nameof<Decorator>(d => d.getTypeArguments), () => {
        it("should return an empty array when not a decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getTypeArguments()).to.deep.equal([]);
        });

        it("should get the type arguments when a decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator<number, string>()\nclass Identifier {}");
            expect(firstDecorator.getTypeArguments().length).to.equal(2);
        });
    });

    describe(nameof<Decorator>(n => n.removeTypeArgument), () => {
        function doRemoveTypeArgTest(code: string, argIndexToRemove: number, expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
            firstChild.getDecorators()[0].removeTypeArgument(argIndexToRemove);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should throw when not a call expression", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("@decorator\nclass MyClass {}");
            expect(() => firstChild.getDecorators()[0].getCallExpression()!.removeTypeArgument(0)).to.throw();
        });

        it("should remove when the only type argument", () => {
            doRemoveTypeArgTest("@decorator<MyClass>(arg1, arg2)\nclass MyClass {}", 0,
                "@decorator(arg1, arg2)\nclass MyClass {}");
        });
    });

    describe(nameof<Decorator>(d => d.remove), () => {
        describe("class decorators", () => {
            function doTest(code: string, index: number, expectedText: string) {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
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
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
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
            doTestByIndex();
            doTestByArg();

            function doTestByIndex() {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(text);
                firstChild.getDecorators()[0].removeArgument(removeIndex);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            function doTestByArg() {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(text);
                firstChild.getDecorators()[0].removeArgument(firstChild.getDecorators()[0].getArguments()[removeIndex]);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }
        }

        it("should throw when specifying an invalid index", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("@test(1, 2, 3)\nclass T {}");
            expect(() => firstChild.getDecorators()[0].removeArgument(3)).to.throw();
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
