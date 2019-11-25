import { expect } from "chai";
import { EnumDeclaration, StatementedNode, Node } from "../../../../../compiler";
import { EnumDeclarationStructure } from "../../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia } from "../../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertEnums), () => {
        function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<EnumDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertEnums(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                name: "MyEnum",
                members: [{ name: "member" }],
                isConst: true
            }], "const enum MyEnum {\n    member\n}\n");
        });

        it("should insert at the start of a file", () => {
            doTest("class MyClass {\n}\n", 0, [{ name: "MyEnum" }], "enum MyEnum {\n}\n\nclass MyClass {\n}\n");
        });

        it("should insert at the end of a file", () => {
            doTest("class MyClass {\n}\n", 1, [{ name: "MyEnum" }], "class MyClass {\n}\n\nenum MyEnum {\n}\n");
        });

        it("should insert in the middle of children", () => {
            doTest("class MyClass {\n}\n\nclass MyOther {\n}\n", 1, [{ name: "MyEnum" }], "class MyClass {\n}\n\nenum MyEnum {\n}\n\nclass MyOther {\n}\n");
        });

        it("should insert multiple enums", () => {
            doTest("class MyClass {\n}\n", 1, [{ name: "MyEnum" }, { name: "Enum2" }], "class MyClass {\n}\n\nenum MyEnum {\n}\n\nenum Enum2 {\n}\n");
        });

        it("should have the expected text adding to non-source file", () => {
            const { sourceFile } = getInfoFromText("namespace MyNamespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertEnums(0, [{
                name: "MyEnum",
                members: [{ name: "member" }]
            }]);

            expect(sourceFile.getFullText()).to.equal("namespace MyNamespace {\n    enum MyEnum {\n        member\n    }\n}\n");
        });

        it("should insert everything from the structure", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<EnumDeclarationStructure>> = {
                name: "Enum",
                docs: [{ description: "Testing" }],
                hasDeclareKeyword: false,
                isConst: true,
                isDefaultExport: false,
                isExported: true,
                members: [{ name: "member1" }, { name: "member2" }]
            };
            const expectedText = "/** Testing */\nexport const enum Enum {\n    member1,\n    member2\n}\n";
            doTest("", 0, [structure], expectedText);
        });
    });

    describe(nameof<StatementedNode>(n => n.insertEnum), () => {
        function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<EnumDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertEnum(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(EnumDeclaration);
        }

        it("should insert an enum", () => {
            doTest("class MyClass {\n}\n", 0, { name: "MyEnum" }, "enum MyEnum {\n}\n\nclass MyClass {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addEnums), () => {
        function doTest(startCode: string, structures: OptionalKindAndTrivia<EnumDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addEnums(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add enums", () => {
            doTest("class MyClass {\n}\n", [{ name: "MyEnum" }, { name: "Enum2" }], "class MyClass {\n}\n\nenum MyEnum {\n}\n\nenum Enum2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addEnum), () => {
        function doTest(startCode: string, structure: OptionalKindAndTrivia<EnumDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addEnum(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(EnumDeclaration);
        }

        it("should add an enum", () => {
            doTest("class MyClass {\n}\n", { name: "MyEnum" }, "class MyClass {\n}\n\nenum MyEnum {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getEnums), () => {
        const { sourceFile } = getInfoFromText("enum Identifier1 {}\nenum Identifier2 { member }");
        const enums = sourceFile.getEnums();

        it("should have the expected number of enums", () => {
            expect(enums.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(enums[0]).to.be.instanceOf(EnumDeclaration);
        });

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getEnums()).to.deep.equal([]);
        });
    });

    describe(nameof<StatementedNode>(n => n.getEnum), () => {
        const { sourceFile } = getInfoFromText("enum Identifier1 {}\nenum Identifier2 { member }");

        it("should get an enum by a name", () => {
            expect(sourceFile.getEnum("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a enum by a search function", () => {
            expect(sourceFile.getEnum(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the enum doesn't exist", () => {
            expect(sourceFile.getEnum("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getEnumOrThrow), () => {
        const { sourceFile } = getInfoFromText("enum Identifier1 {}\nenum Identifier2 { member }");

        it("should get an enum by a name", () => {
            expect(sourceFile.getEnumOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a enum by a search function", () => {
            expect(sourceFile.getEnumOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should throw when the enum doesn't exist", () => {
            expect(() => sourceFile.getEnumOrThrow("asdf")).to.throw();
        });
    });
});
