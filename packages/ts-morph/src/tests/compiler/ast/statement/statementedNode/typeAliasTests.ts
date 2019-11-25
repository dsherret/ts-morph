import { expect } from "chai";
import { StatementedNode, TypeAliasDeclaration, Node } from "../../../../../compiler";
import { TypeAliasDeclarationStructure } from "../../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia } from "../../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertTypeAliases), () => {
        function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<TypeAliasDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertTypeAliases(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                name: "Identifier",
                type: "string"
            }], "type Identifier = string;\n");
        });

        it("should insert at the start with two new lines for a non-type alias after", () => {
            doTest("namespace Identifier2 {\n}\n", 0, [{ name: "Identifier1", type: "string" }], "type Identifier1 = string;\n\nnamespace Identifier2 {\n}\n");
        });

        it("should insert at the start with one new lines for a type alias after", () => {
            doTest("type Identifier2 = string;\n", 0, [{ name: "Identifier1", type: writer => writer.write("string") }],
                "type Identifier1 = string;\ntype Identifier2 = string;\n");
        });

        it("should insert at the end of a file with two new lines for a non-type alias before", () => {
            doTest("namespace Identifier1 {\n}\n", 1, [{ name: "Identifier2", type: "string" }], "namespace Identifier1 {\n}\n\ntype Identifier2 = string;\n");
        });

        it("should insert in the middle of children", () => {
            doTest("namespace Identifier1 {\n}\n\nnamespace Identifier3 {\n}\n", 1, [{ name: "Identifier2", type: "string" }],
                "namespace Identifier1 {\n}\n\ntype Identifier2 = string;\n\nnamespace Identifier3 {\n}\n");
        });

        it("should insert multiple", () => {
            doTest("namespace Identifier1 {\n}\n", 1, [{ name: "Identifier2", type: "number" }, { name: "Identifier3", type: "string" }],
                "namespace Identifier1 {\n}\n\ntype Identifier2 = number;\ntype Identifier3 = string;\n");
        });

        it("should have the expected text adding to non-source file", () => {
            const { sourceFile } = getInfoFromText("namespace Identifier {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertTypeAliases(0, [{
                name: "Identifier",
                type: "string"
            }]);

            expect(sourceFile.getFullText()).to.equal("namespace Identifier {\n    type Identifier = string;\n}\n");
        });

        it("should insert everything from the structure", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<TypeAliasDeclarationStructure>> = {
                docs: [{ description: "Testing" }],
                hasDeclareKeyword: false,
                name: "Name",
                type: "number",
                isDefaultExport: false,
                isExported: true,
                typeParameters: [{ name: "T" }]
            };
            const expectedText = "/** Testing */\nexport type Name<T> = number;\n";
            doTest("", 0, [structure], expectedText);
        });
    });

    describe(nameof<StatementedNode>(n => n.insertTypeAlias), () => {
        function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<TypeAliasDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertTypeAlias(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(TypeAliasDeclaration);
        }

        it("should insert", () => {
            doTest("namespace Identifier2 {\n}\n", 0, { name: "Identifier1", type: "string" }, "type Identifier1 = string;\n\nnamespace Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addTypeAliases), () => {
        function doTest(startCode: string, structures: OptionalKindAndTrivia<TypeAliasDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addTypeAliases(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("namespace Identifier1 {\n}\n", [{ name: "Identifier2", type: "string" }, { name: "Identifier3", type: "number" }],
                "namespace Identifier1 {\n}\n\ntype Identifier2 = string;\ntype Identifier3 = number;\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addTypeAlias), () => {
        function doTest(startCode: string, structure: OptionalKindAndTrivia<TypeAliasDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addTypeAlias(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(TypeAliasDeclaration);
        }

        it("should add one", () => {
            doTest("namespace Identifier1 {\n}\n", { name: "Identifier2", type: "string" }, "namespace Identifier1 {\n}\n\ntype Identifier2 = string;\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getTypeAliases), () => {
        const { sourceFile } = getInfoFromText("type Identifier1 = string;\ntype Identifier2 = number;");
        const typeAliases = sourceFile.getTypeAliases();

        it("should have the expected number of typeAliases", () => {
            expect(typeAliases.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(typeAliases[0]).to.be.instanceOf(TypeAliasDeclaration);
        });

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getTypeAliases()).to.deep.equal([]);
        });
    });

    describe(nameof<StatementedNode>(n => n.getTypeAlias), () => {
        const { sourceFile } = getInfoFromText("type Identifier1 = string;\ntype Identifier2 = number;");

        it("should get a type alias by a name", () => {
            expect(sourceFile.getTypeAlias("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a type alias by a search function", () => {
            expect(sourceFile.getTypeAlias(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the type alias doesn't exist", () => {
            expect(sourceFile.getTypeAlias("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getTypeAliasOrThrow), () => {
        const { sourceFile } = getInfoFromText("type Identifier1 = string;\ntype Identifier2 = number;");

        it("should get a type alias by a name", () => {
            expect(sourceFile.getTypeAliasOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a type alias by a search function", () => {
            expect(sourceFile.getTypeAliasOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should throw when the type alias doesn't exist", () => {
            expect(() => sourceFile.getTypeAliasOrThrow("asdf")).to.throw();
        });
    });
});
