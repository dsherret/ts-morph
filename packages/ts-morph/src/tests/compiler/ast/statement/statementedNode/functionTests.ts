import { expect } from "chai";
import { FunctionDeclaration, StatementedNode, Node } from "../../../../../compiler";
import { FunctionDeclarationStructure, StructureKind } from "../../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia } from "../../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertFunctions), () => {
        function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<FunctionDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertFunctions(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                name: "Identifier"
            }], "function Identifier() {\n}\n");
        });

        it("should insert at the start of a file", () => {
            doTest("function Identifier2() {\n}\n", 0, [{ name: "Identifier1" }], "function Identifier1() {\n}\n\nfunction Identifier2() {\n}\n");
        });

        it("should insert at the end of a file", () => {
            doTest("function Identifier1() {\n}\n", 1, [{ name: "Identifier2" }], "function Identifier1() {\n}\n\nfunction Identifier2() {\n}\n");
        });

        it("should insert in the middle of children", () => {
            doTest("function Identifier1() {\n}\n\nfunction Identifier3() {\n}\n", 1, [{ name: "Identifier2" }],
                "function Identifier1() {\n}\n\nfunction Identifier2() {\n}\n\nfunction Identifier3() {\n}\n");
        });

        it("should insert multiple", () => {
            doTest("function Identifier1() {\n}\n", 1, [{ name: "Identifier2" }, { name: "Identifier3" }],
                "function Identifier1() {\n}\n\nfunction Identifier2() {\n}\n\nfunction Identifier3() {\n}\n");
        });

        it("should insert without a name", () => {
            doTest("", 0, [{ isDefaultExport: true, overloads: [{}] }], "export default function();\nexport default function() {\n}\n");
        });

        it("should insert ones with a declaration keyword accordingly", () => {
            doTest("function Identifier1() {\n}\ndeclare function Identifier4(): string;", 1,
                [{ hasDeclareKeyword: true, name: "Identifier2" }, { hasDeclareKeyword: true, name: "Identifier3" }],
                "function Identifier1() {\n}\n\ndeclare function Identifier2();\ndeclare function Identifier3();\ndeclare function Identifier4(): string;");
        });

        it("should have the expected text adding to non-source file", () => {
            const { sourceFile } = getInfoFromText("namespace Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertFunctions(0, [{
                name: "Identifier"
            }]);

            expect(sourceFile.getFullText()).to.equal("namespace Namespace {\n    function Identifier() {\n    }\n}\n");
        });

        it("should insert when the structure has everything the writer supports", () => {
            doTest("", 0, [{ name: "func", parameters: [{ name: "p1" }, { name: "p2" }] }], "function func(p1, p2) {\n}\n");
        });

        it("should insert with only a body text", () => {
            doTest("", 0, [{ name: "func", statements: ["console.log('testing');"] }], "function func() {\n    console.log('testing');\n}\n");
        });

        it("should insert into an ambient context", () => {
            const { sourceFile } = getInfoFromText("declare namespace Namespace {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertFunctions(0, [{
                name: "Identifier"
            }]);

            expect(sourceFile.getFullText()).to.equal("declare namespace Namespace {\n    function Identifier();\n}\n");
        });

        it("should insert all the properties of the structure", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<FunctionDeclarationStructure>> = {
                docs: [{ description: "Test" }],
                name: "f",
                parameters: [{ name: "param" }],
                overloads: [{}],
                isAsync: true,
                isGenerator: true,
                returnType: "string",
                typeParameters: [{ name: "T" }],
                hasDeclareKeyword: false,
                isDefaultExport: false,
                isExported: true,
                statements: [{ kind: StructureKind.Class, name: "C" }, "console.log('here');"]
            };

            doTest(
                "",
                0,
                [structure],
                "export function f();\n/** Test */\nexport async function* f<T>(param): string {\n"
                    + "    class C {\n    }\n\n    console.log('here');\n"
                    + "}\n"
            );
        });
    });

    describe(nameof<StatementedNode>(n => n.insertFunction), () => {
        function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<FunctionDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertFunction(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(FunctionDeclaration);
        }

        it("should insert", () => {
            doTest("function Identifier2() {\n}\n", 0, { name: "Identifier1" }, "function Identifier1() {\n}\n\nfunction Identifier2() {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addFunctions), () => {
        function doTest(startCode: string, structures: OptionalKindAndTrivia<FunctionDeclarationStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addFunctions(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("function Identifier1() {\n}\n", [{ name: "Identifier2" }, { name: "Identifier3" }],
                "function Identifier1() {\n}\n\nfunction Identifier2() {\n}\n\nfunction Identifier3() {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addFunction), () => {
        function doTest(startCode: string, structure: OptionalKindAndTrivia<FunctionDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addFunction(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(FunctionDeclaration);
        }

        it("should add one", () => {
            doTest("function Identifier1() {\n}\n", { name: "Identifier2" }, "function Identifier1() {\n}\n\nfunction Identifier2() {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunctions), () => {
        const { sourceFile } = getInfoFromText("function Identifier1();function Identifier1() {}\nfunction Identifier2() {}"
            + "declare function Identifier3(); declare function Identifier3();");
        const functions = sourceFile.getFunctions();

        it("should have the expected number of functions", () => {
            expect(functions.length).to.equal(4);
        });

        it("should have correct type", () => {
            expect(functions[0]).to.be.instanceOf(FunctionDeclaration);
        });

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getFunctions()).to.deep.equal([]);
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunction), () => {
        const { sourceFile } = getInfoFromText("function Identifier1() {}\nfunction Identifier2() {}");

        it("should get a function by a name", () => {
            expect(sourceFile.getFunction("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a function by a search function", () => {
            expect(sourceFile.getFunction(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the function doesn't exist", () => {
            expect(sourceFile.getFunction("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunctionOrThrow), () => {
        const { sourceFile } = getInfoFromText("function Identifier1() {}\nfunction Identifier2() {}");

        it("should get a function by a name", () => {
            expect(sourceFile.getFunctionOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a function by a search function", () => {
            expect(sourceFile.getFunctionOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should throw when the function doesn't exist", () => {
            expect(() => sourceFile.getFunctionOrThrow("asdf")).to.throw();
        });
    });
});
