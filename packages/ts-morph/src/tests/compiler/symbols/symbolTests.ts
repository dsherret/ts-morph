import { SymbolFlags } from "@ts-morph/common";
import { expect } from "chai";
import { Symbol, TypeAliasDeclaration } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Symbol), () => {
    const { sourceFile: enumSourceFile } = getInfoFromText("enum MyEnum {}");
    const enumDeclaration = enumSourceFile.getEnums()[0];
    const enumNameNodeSymbol = enumDeclaration.getNameNode().getSymbol()!;

    describe(nameof<Symbol>(s => s.getName), () => {
        it("should get the symbol name", () => {
            expect(enumNameNodeSymbol.getName()).to.equal("MyEnum");
        });
    });

    describe(nameof<Symbol>(s => s.getDeclarations), () => {
        it("should get the symbol declarations", () => {
            const result = enumNameNodeSymbol.getDeclarations();
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(enumDeclaration);
        });
    });

    describe(nameof<Symbol>(s => s.getFlags), () => {
        it("should get the symbol flags", () => {
            expect(enumNameNodeSymbol.getFlags()).to.equal(SymbolFlags.RegularEnum);
        });
    });

    describe(nameof<Symbol>(s => s.getExport), () => {
        function doTest(code: string, exportName: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            const exportSymbol = sourceFile.getSymbolOrThrow().getExport(exportName);
            expect(exportSymbol?.getName()).to.equal(expectedName);
        }

        it("should get the export when it exists", () => {
            doTest("export class MyName {}", "MyName", "MyName");
        });

        it("should not get the export when it doesn't exist", () => {
            doTest("export class MyName {}", "MyName2", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getExportOrThrow), () => {
        function doTest(code: string, exportName: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            if (expectedName == null)
                expect(() => sourceFile.getSymbolOrThrow().getExportOrThrow(exportName)).to.throw();
            else
                expect(sourceFile.getSymbolOrThrow().getExportOrThrow(exportName).getName()).to.equal(expectedName);
        }

        it("should get the export when it exists", () => {
            doTest("export class MyName {}", "MyName", "MyName");
        });

        it("should not get the export when it doesn't exist", () => {
            doTest("export class MyName {}", "MyName2", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getGlobalExports), () => {
        function doTest(code: string, exportNames: string[]) {
            const { sourceFile } = getInfoFromText(code, { isDefinitionFile: true });
            expect(sourceFile.getSymbolOrThrow().getGlobalExports().map(e => e.getName())).to.deep.equal(exportNames);
        }

        it("should get the global exports when they exist", () => {
            doTest("export class MyName {}\nexport as namespace test;", ["test"]);
        });

        it("should not get the global exports when they don't exist", () => {
            doTest("export class Test {}", []);
        });
    });

    describe(nameof<Symbol>(s => s.getGlobalExport), () => {
        function doTest(code: string, exportName: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code, { isDefinitionFile: true });
            const exportSymbol = sourceFile.getSymbolOrThrow().getGlobalExport(exportName);
            expect(exportSymbol?.getName()).to.equal(expectedName);
        }

        it("should get the global export when it exists", () => {
            doTest("export class MyName {}\nexport as namespace test;", "test", "test");
        });

        it("should not get the export when it doesn't exist", () => {
            doTest("export class MyName {}\nexport as namespace test;", "otherName", undefined);
        });

        it("should not get the export when not a valid file", () => {
            doTest("export class MyName {}", "MyName", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getGlobalExportOrThrow), () => {
        function doTest(code: string, exportName: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code, { isDefinitionFile: true });
            const symbol = sourceFile.getSymbolOrThrow();
            if (expectedName == null)
                expect(() => symbol.getGlobalExportOrThrow(exportName)).to.throw();
            else
                expect(symbol.getGlobalExportOrThrow(exportName).getName()).to.equal(expectedName);
        }

        it("should get the global export when it exists", () => {
            doTest("export class MyName {}\nexport as namespace test;", "test", "test");
        });

        it("should not get the export when it doesn't exist", () => {
            doTest("export class MyName {}\nexport as namespace test;", "otherName", undefined);
        });

        it("should not get the export when not a valid file", () => {
            doTest("export class MyName {}", "MyName", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getMembers), () => {
        function doTest(code: string, expectedNames: string[]) {
            const { sourceFile } = getInfoFromText(code);
            const typeAlias = sourceFile.getTypeAliasOrThrow("myType");
            const symbol = typeAlias.getType().getSymbolOrThrow();
            expect(symbol.getMembers().map(m => m.getName())).to.deep.equal(expectedNames);
        }

        it("should get the members", () => {
            doTest("type myType = { a: string; b: string; }", ["a", "b"]);
        });
    });

    describe(nameof<Symbol>(s => s.getMember), () => {
        function doTest(code: string, name: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            const typeAlias = sourceFile.getTypeAliasOrThrow("myType");
            const symbol = typeAlias.getType().getSymbolOrThrow();
            expect(symbol.getMember(name)?.getName()).to.equal(expectedName);
        }

        it("should get the member when it exists", () => {
            doTest("type myType = { a: string; }", "a", "a");
        });

        it("should not get the member when it doesn't exist", () => {
            doTest("type myType = { a: string; }", "b", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getMemberOrThrow), () => {
        function doTest(code: string, name: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            const typeAlias = sourceFile.getTypeAliasOrThrow("myType");
            const symbol = typeAlias.getType().getSymbolOrThrow();
            if (expectedName == null)
                expect(() => symbol.getMemberOrThrow(name)).to.throw();
            else
                expect(symbol.getMemberOrThrow(name).getName()).to.equal(expectedName);
        }

        it("should get the member when it exists", () => {
            doTest("type myType = { a: string; }", "a", "a");
        });

        it("should not get the member when it doesn't exist", () => {
            doTest("type myType = { a: string; }", "b", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getAliasedSymbol), () => {
        it("should get the aliased symbol when it exists", () => {
            const { sourceFile } = getInfoFromText("class MyTest {}\nexport default MyTest;");
            expect(sourceFile.getDefaultExportSymbolOrThrow().getAliasedSymbol()!.getName()).to.equal("MyTest");
        });

        it("should return undefined when it doesn't exist", () => {
            const { sourceFile } = getInfoFromText("class MyTest {}\nexport default MyTest;");
            expect(sourceFile.getClassOrThrow("MyTest").getSymbolOrThrow().getAliasedSymbol()).to.be.undefined;
        });
    });

    describe(nameof<Symbol>(s => s.getAliasedSymbolOrThrow), () => {
        it("should get the aliased symbol when it exists", () => {
            const { sourceFile } = getInfoFromText("class MyTest {}\nexport default MyTest;");
            expect(sourceFile.getDefaultExportSymbolOrThrow().getAliasedSymbolOrThrow().getName()).to.equal("MyTest");
        });

        it("should throw when it doesn't exist", () => {
            const { sourceFile } = getInfoFromText("class MyTest {}\nexport default MyTest;");
            expect(() => sourceFile.getClassOrThrow("MyTest").getSymbolOrThrow().getAliasedSymbolOrThrow()).to.throw();
        });
    });

    describe(nameof<Symbol>(s => s.getExportSymbol), () => {
        it("should get the export symbol of an export symbol", () => {
            const { firstChild } = getInfoFromText<TypeAliasDeclaration>("export type T = number;");
            const typeAliasSymbol = firstChild.getNameNode().getSymbolsInScope(SymbolFlags.TypeAlias)[0];
            expect(typeAliasSymbol.getName()).to.equal("T");

            const exportSymbol = typeAliasSymbol.getExportSymbol();
            expect(exportSymbol).to.not.equal(typeAliasSymbol);
            expect(exportSymbol.getName()).to.equal("T");
        });

        it("should return the local symbol ", () => {
            const { firstChild } = getInfoFromText<TypeAliasDeclaration>("type T = number;");
            const typeAliasSymbol = firstChild.getNameNode().getSymbolsInScope(SymbolFlags.TypeAlias)[0];
            expect(typeAliasSymbol.getName()).to.equal("T");

            const exportSymbol = typeAliasSymbol.getExportSymbol();
            expect(exportSymbol).to.equal(typeAliasSymbol);
        });
    });
});
