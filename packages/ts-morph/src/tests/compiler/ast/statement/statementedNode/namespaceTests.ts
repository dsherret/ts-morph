import { expect } from "chai";
import { NamespaceDeclaration, StatementedNode, Node, NamespaceDeclarationKind } from "../../../../../compiler";
import { errors } from "@ts-morph/common";
import { NamespaceDeclarationStructure, StructureKind } from "../../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia } from "../../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertNamespaces), () => {
        function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<NamespaceDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertNamespaces(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                name: "Identifier",
                declarationKind: NamespaceDeclarationKind.Module
            }], "module Identifier {\n}\n");
        });

        it("should insert at the start of a file", () => {
            doTest("namespace Identifier2 {\n}\n", 0, [{ name: "Identifier1" }], "namespace Identifier1 {\n}\n\nnamespace Identifier2 {\n}\n");
        });

        it("should insert at the end of a file", () => {
            doTest("namespace Identifier1 {\n}\n", 1, [{ name: "Identifier2" }], "namespace Identifier1 {\n}\n\nnamespace Identifier2 {\n}\n");
        });

        it("should insert in the middle of children", () => {
            doTest("namespace Identifier1 {\n}\n\nnamespace Identifier3 {\n}\n", 1, [{ name: "Identifier2" }],
                "namespace Identifier1 {\n}\n\nnamespace Identifier2 {\n}\n\nnamespace Identifier3 {\n}\n");
        });

        it("should insert multiple", () => {
            doTest("namespace Identifier1 {\n}\n", 1, [{ name: "Identifier2" }, { name: "Identifier3" }],
                "namespace Identifier1 {\n}\n\nnamespace Identifier2 {\n}\n\nnamespace Identifier3 {\n}\n");
        });

        it("should have the expected text adding to non-source file", () => {
            const { sourceFile } = getInfoFromText("namespace Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertNamespaces(0, [{
                name: "Identifier"
            }]);

            expect(sourceFile.getFullText()).to.equal("namespace Namespace {\n    namespace Identifier {\n    }\n}\n");
        });

        it("should insert all the properties of the structure", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<NamespaceDeclarationStructure>> = {
                docs: [{ description: "Test" }],
                name: "n",
                hasDeclareKeyword: false,
                declarationKind: NamespaceDeclarationKind.Module,
                isDefaultExport: false,
                isExported: true,
                statements: [{ kind: StructureKind.Class, name: "C" }, "console.log('here');"]
            };

            doTest(
                "",
                0,
                [structure],
                "/** Test */\nexport module n {\n"
                    + "    class C {\n    }\n\n    console.log('here');\n"
                    + "}\n"
            );
        });

        it("should insert an ambient method on a class when inserting a namespace with a class into an ambient module", () => {
            const { sourceFile } = getInfoFromText("declare module Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertNamespaces(0, [{
                name: "Namespace",
                statements: [{
                    kind: StructureKind.Class,
                    name: "Identifier",
                    methods: [{ name: "myMethod" }]
                }]
            }]);

            expect(sourceFile.getFullText())
                .to.equal("declare module Namespace {\n    namespace Namespace {\n        class Identifier {\n"
                    + "            myMethod();\n        }\n    }\n}\n");
        });

        it("should insert a global module", () => {
            doTest("", 0, [{
                name: "global",
                declarationKind: NamespaceDeclarationKind.Global
            }], "global {\n}\n");
        });

        it("should insert a global module and ignore value in the name property", () => {
            doTest("", 0, [{
                name: "somethingElse",
                declarationKind: NamespaceDeclarationKind.Global // priority
            }], "global {\n}\n");
        });

        it("should default to ambient module when specifying single quotes", () => {
            doTest("", 0, [{ name: "'Identifier'" }], "declare module 'Identifier' {\n}\n");
        });

        it("should default to ambient module when specifying double quotes", () => {
            doTest("", 0, [{ name: `"Identifier"` }], `declare module "Identifier" {\n}\n`);
        });

        it("should default to ambient module when specifying quotes, but respect hasDeclareKeyword", () => {
            doTest("", 0, [{ name: `"Identifier"`, hasDeclareKeyword: false }], `module "Identifier" {\n}\n`);
        });

        it("should throw when specifying quotes and a namespace declaration kind of namespace", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.insertNamespaces(0, [{ name: `"Identifier"`, declarationKind: NamespaceDeclarationKind.Namespace }]))
                .to.throw(errors.InvalidOperationError, `Cannot print a namespace with quotes for namespace with name "Identifier". `
                    + `Use NamespaceDeclarationKind.Module instead.`);
        });
    });

    describe(nameof<StatementedNode>(n => n.insertNamespace), () => {
        function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<NamespaceDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertNamespace(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(NamespaceDeclaration);
        }

        it("should insert", () => {
            doTest("namespace Identifier2 {\n}\n", 0, { name: "Identifier1" }, "namespace Identifier1 {\n}\n\nnamespace Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addNamespaces), () => {
        function doTest(startCode: string, structures: OptionalKindAndTrivia<NamespaceDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addNamespaces(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("namespace Identifier1 {\n}\n", [{ name: "Identifier2" }, { name: "Identifier3" }],
                "namespace Identifier1 {\n}\n\nnamespace Identifier2 {\n}\n\nnamespace Identifier3 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addNamespace), () => {
        function doTest(startCode: string, structure: OptionalKindAndTrivia<NamespaceDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addNamespace(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(NamespaceDeclaration);
        }

        it("should add one", () => {
            doTest("namespace Identifier1 {\n}\n", { name: "Identifier2" }, "namespace Identifier1 {\n}\n\nnamespace Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getNamespaces), () => {
        const { sourceFile } = getInfoFromText("namespace Identifier1 {}\nnamespace Identifier2 {}");
        const namespaces = sourceFile.getNamespaces();

        it("should have the expected number of namespaces", () => {
            expect(namespaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(namespaces[0]).to.be.instanceOf(NamespaceDeclaration);
        });

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getNamespaces()).to.deep.equal([]);
        });
    });

    describe(nameof<StatementedNode>(n => n.getNamespace), () => {
        const { sourceFile } = getInfoFromText("namespace Identifier1 {}\nnamespace Identifier2 {}, namespace Test.Test {}");

        it("should get a namespace by a name", () => {
            expect(sourceFile.getNamespace("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get namespace by name when it has multiple identifiers", () => {
            expect(sourceFile.getNamespace("Test.Test")!.getName()).to.equal("Test.Test");
        });

        it("should get a namespace by a search function", () => {
            expect(sourceFile.getNamespace(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the namespace doesn't exist", () => {
            expect(sourceFile.getNamespace("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getNamespaceOrThrow), () => {
        const { sourceFile } = getInfoFromText("namespace Identifier1 {}\nnamespace Identifier2 {}");

        it("should get a namespace by a name", () => {
            expect(sourceFile.getNamespaceOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a namespace by a search function", () => {
            expect(sourceFile.getNamespaceOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should throw when the namespace doesn't exist", () => {
            expect(() => sourceFile.getNamespaceOrThrow("asdf")).to.throw();
        });
    });
});
