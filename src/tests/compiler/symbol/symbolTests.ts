import { expect } from "chai";
import { Symbol } from "../../../compiler";
import { SymbolFlags } from "../../../typescript";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Symbol), () => {
    const {sourceFile: enumSourceFile} = getInfoFromText("enum MyEnum {}");
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

    describe(nameof<Symbol>(s => s.getExportByName), () => {
        function doTest(code: string, exportName: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            const exportSymbol = sourceFile.getSymbolOrThrow().getExportByName(exportName);
            if (expectedName == null)
                expect(exportSymbol).to.be.undefined;
            else
                expect(exportSymbol!.getName()).to.equal(expectedName);
        }

        it("should get the export when it exists", () => {
            doTest("export class MyName {}", "MyName", "MyName");
        });

        it("should not get the export when it doesn't exist", () => {
            doTest("export class MyName {}", "MyName2", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getExportByNameOrThrow), () => {
        function doTest(code: string, exportName: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            if (expectedName == null)
                expect(() => sourceFile.getSymbolOrThrow().getExportByNameOrThrow(exportName)).to.throw();
            else
                expect(sourceFile.getSymbolOrThrow().getExportByNameOrThrow(exportName).getName()).to.equal(expectedName);
        }

        it("should get the export when it exists", () => {
            doTest("export class MyName {}", "MyName", "MyName");
        });

        it("should not get the export when it doesn't exist", () => {
            doTest("export class MyName {}", "MyName2", undefined);
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

    describe(nameof<Symbol>(s => s.getMemberByName), () => {
        function doTest(code: string, name: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            const typeAlias = sourceFile.getTypeAliasOrThrow("myType");
            const symbol = typeAlias.getType().getSymbolOrThrow();
            if (expectedName == null)
                expect(symbol.getMemberByName(name)).to.be.undefined;
            else
                expect(symbol.getMemberByName(name)!.getName()).to.equal(expectedName);
        }

        it("should get the member when it exists", () => {
            doTest("type myType = { a: string; }", "a", "a");
        });

        it("should not get the member when it doesn't exist", () => {
            doTest("type myType = { a: string; }", "b", undefined);
        });
    });

    describe(nameof<Symbol>(s => s.getMemberByNameOrThrow), () => {
        function doTest(code: string, name: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(code);
            const typeAlias = sourceFile.getTypeAliasOrThrow("myType");
            const symbol = typeAlias.getType().getSymbolOrThrow();
            if (expectedName == null)
                expect(() => symbol.getMemberByNameOrThrow(name)).to.throw();
            else
                expect(symbol.getMemberByNameOrThrow(name).getName()).to.equal(expectedName);
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
});
