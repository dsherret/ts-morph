import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, DecoratableNode, Decorator } from "../../../../compiler";
import { DecoratableNodeStructure, DecoratorStructure, OptionalKind } from "../../../../structures";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(DecoratableNode), () => {
    describe(nameof<DecoratableNode>(d => d.getDecorator), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("@log\n@log2\nclass Class {}");

        it("should get the decorator by name", () => {
            expect(firstChild.getDecorator("log")!.getName()).to.equal("log");
        });

        it("should get the decorator by function", () => {
            expect(firstChild.getDecorator(p => p.getName() === "log2")).to.equal(firstChild.getDecorators()[1]);
        });

        it("should return undefined when it doesn't exist", () => {
            expect(firstChild.getDecorator("decorator")).to.be.undefined;
        });
    });

    describe(nameof<DecoratableNode>(d => d.getDecoratorOrThrow), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("@log\n@log2\nclass Class {}");

        it("should get the decorator by name", () => {
            expect(firstChild.getDecoratorOrThrow("log").getName()).to.equal("log");
        });

        it("should get the decorator by function", () => {
            expect(firstChild.getDecoratorOrThrow(p => p.getName() === "log2")).to.equal(firstChild.getDecorators()[1]);
        });

        it("should throw when it doesn't exist", () => {
            expect(() => firstChild.getDecoratorOrThrow("decoratorNamedNodeByNameOrFindFunctionSupportedTypes")).to.throw();
        });
    });

    describe(nameof<DecoratableNode>(n => n.getDecorators), () => {
        function doTest(text: string, expectedLength: number) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(text);
            expect(firstChild.getDecorators().length).to.equal(expectedLength);
        }

        it("should return an empty array for no decorators", () => {
            doTest("class Identifier {}", 0);
        });

        it("should get the decorators when they exist", () => {
            doTest("@decorator\n@decorator2()\n@decorator3('str')\nclass Identifier {}", 3);
        });
    });

    describe(nameof<DecoratableNode>(n => n.insertDecorators), () => {
        describe("class decorators", () => {
            function doTest(startCode: string, index: number, structures: OptionalKind<DecoratorStructure>[], expectedCode: string) {
                const { descendant, sourceFile } = getInfoFromTextWithDescendant<ClassDeclaration>(startCode, SyntaxKind.ClassDeclaration);
                const result = descendant.insertDecorators(index, structures);
                expect(result.length).to.equal(structures.length);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should insert when there are no decorators", () => {
                doTest("class MyClass {}", 0, [{ name: "dec" }], "@dec\nclass MyClass {}");
            });

            it("should insert with arguments", () => {
                doTest("class MyClass {}", 0, [
                    { name: "dec", arguments: [] },
                    { name: "dec2", arguments: ["1"] },
                    { name: "dec3", arguments: ["1", writer => writer.write("2")] }
                ], "@dec()\n@dec2(1)\n@dec3(1, 2)\nclass MyClass {}");
            });

            it("should insert on the same indentation level", () => {
                doTest("namespace N {\n    class MyClass {}\n}", 0, [{ name: "dec" }, { name: "dec2" }],
                    "namespace N {\n    @dec\n    @dec2\n    class MyClass {}\n}");
            });

            it("should insert at the start", () => {
                doTest("@dec3\nclass MyClass {}", 0, [{ name: "dec" }, { name: "dec2" }], "@dec\n@dec2\n@dec3\nclass MyClass {}");
            });

            it("should insert multiple in the middle", () => {
                doTest("@dec\n@dec4\nclass MyClass {}", 1, [{ name: "dec2" }, { name: "dec3" }], "@dec\n@dec2\n@dec3\n@dec4\nclass MyClass {}");
            });

            it("should insert one in the middle at the same indentation", () => {
                doTest("namespace N {\n    @dec\n    @dec3\nclass MyClass {}\n}", 1, [{ name: "dec2" }],
                    "namespace N {\n    @dec\n    @dec2\n    @dec3\nclass MyClass {}\n}");
            });

            it("should insert multiple in the middle at the same indentation", () => {
                doTest(
                    "namespace N {\n    @dec\n    @dec5\nclass MyClass {}\n}",
                    1,
                    [{ name: "dec2" }, { name: "dec3" }, { name: "dec4" }],
                    "namespace N {\n    @dec\n    @dec2\n    @dec3\n    @dec4\n    @dec5\nclass MyClass {}\n}"
                );
            });

            it("should insert when the decorators are on the same line", () => {
                doTest(
                    "    @dec @dec3\n    class MyClass {}",
                    1,
                    [{ name: "dec2" }],
                    "    @dec @dec2 @dec3\n    class MyClass {}"
                );
            });

            it("should insert at the end", () => {
                doTest("@dec\nclass MyClass {}", 1, [{ name: "dec2" }, { name: "dec3" }], "@dec\n@dec2\n@dec3\nclass MyClass {}");
            });
        });

        describe("parameter decorator", () => {
            function doTest(startCode: string, index: number, structures: OptionalKind<DecoratorStructure>[], expectedCode: string) {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
                const result = firstChild.getInstanceMethods()[0].getParameters()[0].insertDecorators(index, structures);
                expect(result.length).to.equal(structures.length);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should insert on the same line when none exists", () => {
                doTest(
                    "class MyClass { myMethod(param) {} }",
                    0,
                    [{ name: "dec" }],
                    "class MyClass { myMethod(@dec param) {} }"
                );
            });

            it("should insert at the start on the same line", () => {
                doTest(
                    "class MyClass { myMethod(@dec2 param) {} }",
                    0,
                    [{ name: "dec1" }],
                    "class MyClass { myMethod(@dec1 @dec2 param) {} }"
                );
            });

            it("should insert at the end on the same line", () => {
                doTest(
                    "class MyClass { myMethod(@dec1 param) {} }",
                    1,
                    [{ name: "dec2" }],
                    "class MyClass { myMethod(@dec1 @dec2 param) {} }"
                );
            });
        });
    });

    describe(nameof<DecoratableNode>(n => n.insertDecorator), () => {
        function doTest(startCode: string, index: number, structure: OptionalKind<DecoratorStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertDecorator(index, structure);
            expect(result).to.be.instanceOf(Decorator);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert in the middle", () => {
            doTest("@dec\n@dec3\nclass MyClass {}", 1, { name: "dec2" }, "@dec\n@dec2\n@dec3\nclass MyClass {}");
        });
    });

    describe(nameof<DecoratableNode>(n => n.addDecorator), () => {
        function doTest(startCode: string, structure: OptionalKind<DecoratorStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addDecorator(structure);
            expect(result).to.be.instanceOf(Decorator);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add when one doesn't exists", () => {
            doTest("class MyClass {}", { name: "dec" }, "@dec\nclass MyClass {}");
        });

        it("should add when one exists", () => {
            doTest("@dec\nclass MyClass {}", { name: "dec2" }, "@dec\n@dec2\nclass MyClass {}");
        });
    });

    describe(nameof<DecoratableNode>(n => n.addDecorators), () => {
        function doTest(startCode: string, structures: OptionalKind<DecoratorStructure>[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addDecorators(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest("@dec\nclass MyClass {}", [{ name: "dec2" }, { name: "dec3" }], "@dec\n@dec2\n@dec3\nclass MyClass {}");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: DecoratableNodeStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.set(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("class Identifier {}", { decorators: [{ name: "dec1" }, { name: "dec2" }] }, "@dec1\n@dec2\nclass Identifier {}");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class Identifier {}", {}, "class Identifier {}");
        });

        it("should replace existing decorators", () => {
            doTest("@old1 @old2 class Identifier {}", { decorators: [{ name: "newDec" }] }, "@newDec\nclass Identifier {}");
        });

        it("should remove existing decorators when specifying a value", () => {
            doTest("@old1 @old2 class Identifier {}", { decorators: [] }, "class Identifier {}");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.getStructure), () => {
        function doTest(startingCode: string, names: string[]) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            expect(firstChild.getStructure().decorators!.map(d => d.name)).to.deep.equal(names);
        }

        it("should get when there are none", () => {
            doTest("class Identifier {}", []);
        });

        it("should get when there are some", () => {
            doTest("@dec @dec2 class Identifier {}", ["dec", "dec2"]);
        });
    });
});
