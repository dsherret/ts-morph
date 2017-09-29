import {expect} from "chai";
import {StatementedNode, ClassDeclaration} from "./../../../../compiler";
import {ClassDeclarationStructure} from "./../../../../structures";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertClasses), () => {
        function doTest(startCode: string, index: number, structures: ClassDeclarationStructure[], expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertClasses(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                name: "Identifier"
            }], "class Identifier {\n}\n");
        });

        it("should insert at the start of a file", () => {
            doTest("enum Enum {\n}\n", 0, [{ name: "Identifier" }], "class Identifier {\n}\n\nenum Enum {\n}\n");
        });

        it("should insert at the end of a file", () => {
            doTest("enum Enum {\n}\n", 1, [{ name: "Identifier" }], "enum Enum {\n}\n\nclass Identifier {\n}\n");
        });

        it("should insert in the middle of children", () => {
            doTest("class Identifier1 {\n}\n\nclass Identifier3 {\n}\n", 1, [{ name: "Identifier2" }], "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n\nclass Identifier3 {\n}\n");
        });

        it("should insert multiple", () => {
            doTest("class Identifier1 {\n}\n", 1, [{ name: "Identifier2" }, { name: "Identifier3" }], "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n\nclass Identifier3 {\n}\n");
        });

        it("should have the expected text adding to non-source file", () => {
            const {sourceFile} = getInfoFromText("namespace Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertClasses(0, [{
                name: "Identifier"
            }]);

            expect(sourceFile.getFullText()).to.equal("namespace Namespace {\n    class Identifier {\n    }\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.insertClass), () => {
        function doTest(startCode: string, index: number, structure: ClassDeclarationStructure, expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertClass(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(ClassDeclaration);
        }

        it("should insert", () => {
            doTest("class Identifier2 {\n}\n", 0, { name: "Identifier1" }, "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addClasses), () => {
        function doTest(startCode: string, structures: ClassDeclarationStructure[], expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addClasses(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("class Identifier1 {\n}\n", [{ name: "Identifier2" }, { name: "Identifier3" }], "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n\nclass Identifier3 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addClass), () => {
        function doTest(startCode: string, structure: ClassDeclarationStructure, expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addClass(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(ClassDeclaration);
        }

        it("should add one", () => {
            doTest("class Identifier1 {\n}\n", { name: "Identifier2" }, "class Identifier1 {\n}\n\nclass Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getClasses), () => {
        const {sourceFile} = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");
        const classes = sourceFile.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getClass), () => {
        const {sourceFile} = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");

        it("should get a class by a name", () => {
            expect(sourceFile.getClass("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a class by a search function", () => {
            expect(sourceFile.getClass(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the class doesn't exist", () => {
            expect(sourceFile.getClass("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getClassOrThrow), () => {
        const {sourceFile} = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");

        it("should get a class by a name", () => {
            expect(sourceFile.getClassOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a class by a search function", () => {
            expect(sourceFile.getClassOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should throw when the class doesn't exist", () => {
            expect(() => sourceFile.getClassOrThrow("asdf")).to.throw();
        });
    });
});
