import {expect} from "chai";
import {DecoratorStructure} from "./../../../structures";
import {DecoratableNode, Decorator, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(DecoratableNode), () => {
    describe(nameof<DecoratableNode>(n => n.getDecorators), () => {
        it("should return an empty array for no decorators", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            expect(firstChild.getDecorators().length).to.equal(0);
        });

        it("should get the decorators when they exist", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("@decorator\n@decorator2()\n@decorator3('str')\nclass Identifier {}");
            expect(firstChild.getDecorators().length).to.equal(3);
        });
    });

    describe(nameof<DecoratableNode>(n => n.insertDecorators), () => {
        function doTest(startCode: string, index: number, structures: DecoratorStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertDecorators(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when there are no decorators", () => {
            doTest("class MyClass {}", 0, [{ name: "dec" }], "@dec\nclass MyClass {}");
        });

        it("should insert with arguments", () => {
            doTest("class MyClass {}", 0, [{ name: "dec", arguments: [] }, { name: "dec2", arguments: ["1"] }, { name: "dec3", arguments: ["1", "2"] }],
                "@dec()\n@dec2(1)\n@dec3(1, 2)\nclass MyClass {}");
        });

        it("should insert on the same indentation level", () => {
            doTest("    class MyClass {}", 0, [{ name: "dec" }, { name: "dec2" }], "    @dec\n    @dec2\n    class MyClass {}");
        });

        it("should insert at the start", () => {
            doTest("@dec3\nclass MyClass {}", 0, [{ name: "dec" }, { name: "dec2" }], "@dec\n@dec2\n@dec3\nclass MyClass {}");
        });

        it("should insert multiple in the middle", () => {
            doTest("@dec\n@dec4\nclass MyClass {}", 1, [{ name: "dec2" }, { name: "dec3" }], "@dec\n@dec2\n@dec3\n@dec4\nclass MyClass {}");
        });

        it("should insert one in the middle at the same indentation", () => {
            doTest("    @dec\n    @dec3\nclass MyClass {}", 1, [{ name: "dec2" }], "    @dec\n    @dec2\n    @dec3\nclass MyClass {}");
        });

        it("should insert multiple in the middle at the same indentation", () => {
            doTest(
                "    @dec\n    @dec5\nclass MyClass {}", 1, [{ name: "dec2" }, { name: "dec3" }, { name: "dec4" }],
                "    @dec\n    @dec2\n    @dec3\n    @dec4\n    @dec5\nclass MyClass {}"
            );
        });

        it("should insert when the decorators are on the same line", () => {
            doTest(
                "    @dec @dec3\n    class MyClass {}", 1, [{ name: "dec2" }],
                "    @dec @dec2\n    @dec3\n    class MyClass {}" // for now...
            );
        });

        it("should insert at the end", () => {
            doTest("@dec\nclass MyClass {}", 1, [{ name: "dec2" }, { name: "dec3" }], "@dec\n@dec2\n@dec3\nclass MyClass {}");
        });
    });

    describe(nameof<DecoratableNode>(n => n.insertDecorator), () => {
        function doTest(startCode: string, index: number, structure: DecoratorStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertDecorator(index, structure);
            expect(result).to.be.instanceOf(Decorator);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert in the middle", () => {
            doTest("@dec\n@dec3\nclass MyClass {}", 1, { name: "dec2" }, "@dec\n@dec2\n@dec3\nclass MyClass {}");
        });
    });

    describe(nameof<DecoratableNode>(n => n.addDecorator), () => {
        function doTest(startCode: string, structure: DecoratorStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
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
        function doTest(startCode: string, structures: DecoratorStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addDecorators(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest("@dec\nclass MyClass {}", [{ name: "dec2" }, { name: "dec3" }], "@dec\n@dec2\n@dec3\nclass MyClass {}");
        });
    });
});
