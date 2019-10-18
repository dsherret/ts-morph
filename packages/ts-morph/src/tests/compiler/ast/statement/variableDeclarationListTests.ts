import { expect } from "chai";
import { VariableDeclaration, VariableDeclarationKind, VariableDeclarationList } from "../../../../compiler";
import { VariableDeclarationStructure, OptionalKind } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(VariableDeclarationList), () => {
    describe(nameof<VariableDeclarationList>(d => d.getDeclarationKind), () => {
        function doTest(code: string, expectedType: VariableDeclarationKind) {
            const { firstChild } = getInfoFromText<VariableDeclarationList>(code);
            expect(firstChild.getDeclarationKind()).to.equal(expectedType);
        }

        it("should get var for a var variable", () => {
            doTest("var myVar;", VariableDeclarationKind.Var);
        });

        it("should get let for a let variable", () => {
            doTest("let myVar;", VariableDeclarationKind.Let);
        });

        it("should get const for a const variable", () => {
            doTest("const myVar = 3;", VariableDeclarationKind.Const);
        });
    });

    describe(nameof<VariableDeclarationList>(d => d.getDeclarationKindKeyword), () => {
        function doTest(code: string, expectedType: VariableDeclarationKind) {
            const { firstChild } = getInfoFromText<VariableDeclarationList>(code);
            expect(firstChild.getDeclarationKindKeyword().getText()).to.equal(expectedType);
        }

        it("should get var for a var variable", () => {
            doTest("var myVar;", VariableDeclarationKind.Var);
        });

        it("should get let for a let variable", () => {
            doTest("let myVar;", VariableDeclarationKind.Let);
        });

        it("should get const for a const variable", () => {
            doTest("const myVar = 3;", VariableDeclarationKind.Const);
        });
    });

    describe(nameof<VariableDeclarationList>(d => d.setDeclarationKind), () => {
        function doTest(code: string, newType: VariableDeclarationKind, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableDeclarationList>(code);
            firstChild.setDeclarationKind(newType);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the type when it is the same", () => {
            doTest("var myVar;", VariableDeclarationKind.Var, "var myVar;");
        });

        it("should change to let", () => {
            doTest("var myVar;", VariableDeclarationKind.Let, "let myVar;");
        });

        it("should change to const", () => {
            doTest("var myVar;", VariableDeclarationKind.Const, "const myVar;");
        });

        it("should change to var", () => {
            doTest("let myVar;", VariableDeclarationKind.Var, "var myVar;");
        });
    });

    describe(nameof<VariableDeclarationList>(d => d.insertDeclarations), () => {
        function doTest(startText: string, index: number, structures: OptionalKind<VariableDeclarationStructure>[], expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableDeclarationList>(startText);
            const result = firstChild.insertDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert declarations at the beginning", () => {
            doTest("export var v4;", 0, [{ name: "v1" }, { name: "v2", type: "string" }, { name: "v3", initializer: "5" }],
                "export var v1, v2: string, v3 = 5, v4;");
        });

        it("should insert declarations in the middle", () => {
            doTest(
                "var v1, v4;",
                1,
                [{ name: "v2" }, { name: "v3", type: "number", initializer: "5" }],
                "var v1, v2, v3: number = 5, v4;"
            );
        });

        it("should insert declarations at the end", () => {
            doTest(
                "var v1;",
                1,
                [{ name: "v2" }, { name: "v3" }],
                "var v1, v2, v3;"
            );
        });
    });

    describe(nameof<VariableDeclarationList>(d => d.insertDeclaration), () => {
        function doTest(startText: string, index: number, structure: OptionalKind<VariableDeclarationStructure>, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableDeclarationList>(startText);
            const result = firstChild.insertDeclaration(index, structure);
            expect(result).to.be.instanceOf(VariableDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert a declaration", () => {
            doTest("var v1, v3;", 1, { name: "v2" }, "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableDeclarationList>(d => d.addDeclarations), () => {
        function doTest(startText: string, structures: OptionalKind<VariableDeclarationStructure>[], expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableDeclarationList>(startText);
            const result = firstChild.addDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add declarations", () => {
            doTest("var v1;", [{ name: "v2" }, { name: "v3" }], "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableDeclarationList>(d => d.addDeclaration), () => {
        function doTest(startText: string, structure: OptionalKind<VariableDeclarationStructure>, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableDeclarationList>(startText);
            const result = firstChild.addDeclaration(structure);
            expect(result).to.be.instanceOf(VariableDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add a declaration", () => {
            doTest("var v1;", { name: "v2" }, "var v1, v2;");
        });
    });
});
