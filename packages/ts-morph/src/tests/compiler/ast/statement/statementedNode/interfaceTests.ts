import { expect } from "chai";
import { InterfaceDeclaration, StatementedNode, Node } from "../../../../../compiler";
import { InterfaceDeclarationStructure } from "../../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia } from "../../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertInterfaces), () => {
        function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<InterfaceDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertInterfaces(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                name: "Identifier"
            }], "interface Identifier {\n}\n");
        });

        it("should insert at the start of a file", () => {
            doTest("interface Identifier2 {\n}\n", 0, [{ name: "Identifier1" }], "interface Identifier1 {\n}\n\ninterface Identifier2 {\n}\n");
        });

        it("should insert at the end of a file", () => {
            doTest("interface Identifier1 {\n}\n", 1, [{ name: "Identifier2" }], "interface Identifier1 {\n}\n\ninterface Identifier2 {\n}\n");
        });

        it("should insert in the middle of children", () => {
            doTest("interface Identifier1 {\n}\n\ninterface Identifier3 {\n}\n", 1, [{ name: "Identifier2" }],
                "interface Identifier1 {\n}\n\ninterface Identifier2 {\n}\n\ninterface Identifier3 {\n}\n");
        });

        it("should insert multiple", () => {
            doTest("interface Identifier1 {\n}\n", 1, [{ name: "Identifier2" }, { name: "Identifier3" }],
                "interface Identifier1 {\n}\n\ninterface Identifier2 {\n}\n\ninterface Identifier3 {\n}\n");
        });

        it("should have the expected text adding to non-source file", () => {
            const { sourceFile } = getInfoFromText("namespace Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertInterfaces(0, [{
                name: "Identifier"
            }]);

            expect(sourceFile.getFullText()).to.equal("namespace Namespace {\n    interface Identifier {\n    }\n}\n");
        });

        it("should insert everything in a structure", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<InterfaceDeclarationStructure>> = {
                name: "I",
                docs: [{ description: "Test" }],
                extends: ["IBase", "IBase2"],
                hasDeclareKeyword: false,
                isDefaultExport: true,
                isExported: true,
                typeParameters: [{ name: "T" }],
                callSignatures: [{}],
                constructSignatures: [{}],
                indexSignatures: [{ returnType: "string" }],
                properties: [{ name: "p" }],
                methods: [{ name: "m" }]
            };
            const expectedText = "/** Test */\nexport default interface I<T> extends IBase, IBase2 {\n"
                + "    (): void;\n"
                + "    new();\n"
                + "    [key: string]: string;\n"
                + "    p;\n"
                + "    m();\n"
                + "}\n";
            doTest("", 0, [structure], expectedText);
        });
    });

    describe(nameof<StatementedNode>(n => n.insertInterface), () => {
        function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<InterfaceDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertInterface(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        }

        it("should insert", () => {
            doTest("interface Identifier2 {\n}\n", 0, { name: "Identifier1" }, "interface Identifier1 {\n}\n\ninterface Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addInterfaces), () => {
        function doTest(startCode: string, structures: OptionalKindAndTrivia<InterfaceDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addInterfaces(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("interface Identifier1 {\n}\n", [{ name: "Identifier2" }, { name: "Identifier3" }],
                "interface Identifier1 {\n}\n\ninterface Identifier2 {\n}\n\ninterface Identifier3 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addInterface), () => {
        function doTest(startCode: string, structure: OptionalKindAndTrivia<InterfaceDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addInterface(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(InterfaceDeclaration);
        }

        it("should add one", () => {
            doTest("interface Identifier1 {\n}\n", { name: "Identifier2" }, "interface Identifier1 {\n}\n\ninterface Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterfaces), () => {
        const { sourceFile } = getInfoFromText("interface Identifier1 {}\ninterface Identifier2 {}");
        const interfaces = sourceFile.getInterfaces();

        it("should have the expected number of interfaces", () => {
            expect(interfaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(interfaces[0]).to.be.instanceOf(InterfaceDeclaration);
        });

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getInterfaces()).to.deep.equal([]);
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterface), () => {
        const { sourceFile } = getInfoFromText("interface Identifier1 {}\ninterface Identifier2 {}");

        it("should get an interface by a name", () => {
            expect(sourceFile.getInterface("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a interface by a search function", () => {
            expect(sourceFile.getInterface(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the interface doesn't exist", () => {
            expect(sourceFile.getInterface("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterfaceOrThrow), () => {
        const { sourceFile } = getInfoFromText("interface Identifier1 {}\ninterface Identifier2 {}");

        it("should get an interface by a name", () => {
            expect(sourceFile.getInterfaceOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a interface by a search function", () => {
            expect(sourceFile.getInterfaceOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should throw when the interface doesn't exist", () => {
            expect(() => sourceFile.getInterfaceOrThrow("asdf")).to.throw();
        });
    });
});
