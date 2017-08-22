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

    describe(nameof<Decorator>(d => d.getName), () => {
        it("should get the name for a non-decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });

        it("should get the name for a non-decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstClassDecorator("@namespaceTest.decorator\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });

        it("should get the name for a decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator()\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });

        it("should get the name for a decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstClassDecorator("@namespaceTest.decorator()\nclass Identifier {}");
            expect(firstDecorator.getName()).to.equal("decorator");
        });
    });

    describe(nameof<Decorator>(d => d.getFullName), () => {
        it("should get the name for a non-decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("decorator");
        });

        it("should get the name for a non-decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstClassDecorator("@namespaceTest.decorator\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("namespaceTest.decorator");
        });

        it("should get the name for a decorator factory", () => {
            const {firstDecorator} = getFirstClassDecorator("@decorator()\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("decorator");
        });

        it("should get the name for a decorator factory decorator with a namespace", () => {
            const {firstDecorator} = getFirstClassDecorator("@namespaceTest.decorator()\nclass Identifier {}");
            expect(firstDecorator.getFullName()).to.equal("namespaceTest.decorator");
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
});
