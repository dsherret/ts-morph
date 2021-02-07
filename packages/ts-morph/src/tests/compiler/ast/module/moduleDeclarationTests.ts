import { errors, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ModuleDeclaration, ModuleDeclarationKind, VariableDeclarationKind } from "../../../../compiler";
import { Project } from "../../../../main";
import { ModuleDeclarationSpecificStructure, ModuleDeclarationStructure, OptionalKind, StructureKind } from "../../../../structures";
import { fillStructures, getInfoFromText, OptionalTrivia } from "../../testHelpers";

describe(nameof(ModuleDeclaration), () => {
    describe(nameof<ModuleDeclaration>(d => d.getName), () => {
        function doTest(text: string, expectedName: string) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(text);
            expect(firstChild.getName()).to.equal(expectedName);
        }

        it("should get the name when not using dot notation", () => {
            doTest("namespace MyNamespace {}", "MyNamespace");
        });

        it("should get the name when using dot notation", () => {
            doTest("namespace MyNamespace.Inner.MoreInner {}", "MyNamespace.Inner.MoreInner");
        });

        it("should get the name when in quotes", () => {
            doTest("declare module 'test' {}", "'test'");
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.getNameNodes), () => {
        function doTest(text: string, expectedNames: string[] | string) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(text);
            const names = firstChild.getNameNodes();
            if (names instanceof Array)
                expect(names.map(n => n.getText())).to.deep.equal(expectedNames);
            else
                expect(names.getText()).to.equal(expectedNames);
        }

        it("should get the name nodes when not using dot notation", () => {
            doTest("namespace MyNamespace {}", ["MyNamespace"]);
        });

        it("should get the name nodes when using dot notation", () => {
            doTest("namespace MyNamespace.Inner.MoreInner {}", ["MyNamespace", "Inner", "MoreInner"]);
        });

        it("should get the name when it's a string literal", () => {
            doTest("declare module 'test' {}", "'test'");
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.rename), () => {
        function doTest(text: string, newName: string, expectedText: string) {
            const { sourceFile, firstChild } = getInfoFromText<ModuleDeclaration>(text);
            firstChild.rename(newName);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should rename a namespace that doesn't use dot notation", () => {
            doTest("namespace MyNamespace { export class T {} } const t = MyNamespace.T;", "NewName",
                "namespace NewName { export class T {} } const t = NewName.T;");
        });

        it("should add a namespace keyword for a global module", () => {
            doTest("global {}", "NewName", "namespace NewName {}");
        });

        it("should do nothing for a global module when specifying global", () => {
            doTest("global {}", "global", "global {}");
        });

        it("should throw an exception when passing in a name with a period", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace {}");
            expect(() => firstChild.rename("NewName.Inner")).to.throw(errors.NotSupportedError);
        });

        it("should throw an exception when renaming a namespace whose name uses dot notation", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace.MyInner {}");
            expect(() => firstChild.rename("NewName")).to.throw(errors.NotSupportedError);
        });

        it("should support renaming a string identifier module name", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const testFile = project.createSourceFile("test.d.ts", "declare module 'test' { export class Test {} }");
            const mainFile = project.createSourceFile("main.ts", "/// <reference path='test.d.ts' />\nimport { Test } from 'test';");

            const testModule = testFile.getFirstChildByKindOrThrow(SyntaxKind.ModuleDeclaration);
            testModule.rename("'asdf'");
            expect(testFile.getFullText()).to.equal("declare module 'asdf' { export class Test {} }");
            testModule.rename("testing");
            expect(testFile.getFullText()).to.equal("declare module 'testing' { export class Test {} }");

            // unfortunately the ts compiler won't update the other module declarations
            expect(mainFile.getFullText()).to.equal("/// <reference path='test.d.ts' />\nimport { Test } from 'test';");
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.setName), () => {
        function doTest(text: string, newName: string, expectedText: string) {
            const { sourceFile, firstChild } = getInfoFromText<ModuleDeclaration>(text);
            firstChild.rename(newName);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set the name when not using dot notation", () => {
            doTest("namespace MyNamespace {} const t = MyNamespace;", "NewName", "namespace NewName {} const t = MyNamespace;");
        });

        it("should add a namespace keyword for a global module", () => {
            doTest("global {}", "NewName", "namespace NewName {}");
        });

        it("should do nothing for a global module when specifying global", () => {
            doTest("global {}", "global", "global {}");
        });

        it("should throw an exception when using dot notation because it's not implemented", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace {}");
            expect(() => firstChild.setName("NewName.NewName")).to.throw(errors.NotImplementedError);
        });

        it("should throw an exception when setting a namepsace name that already uses dot notation because it's not implemented", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace.Name {}");
            expect(() => firstChild.setName("NewName")).to.throw(errors.NotImplementedError);
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.hasNamespaceKeyword), () => {
        function doTest(text: string, expected: boolean) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(text);
            expect(firstChild.hasNamespaceKeyword()).to.equal(expected);
        }

        it("should have when it has one", () => {
            doTest("namespace Identifier {}", true);
        });

        it("should not have when a module", () => {
            doTest("module Identifier {}", false);
        });

        it("should not have when a global module", () => {
            doTest("global {}", false);
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.hasModuleKeyword), () => {
        function doTest(text: string, expected: boolean) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(text);
            expect(firstChild.hasModuleKeyword()).to.equal(expected);
        }

        it("should have when it has one", () => {
            doTest("module Identifier {}", true);
        });

        it("should not have when a namespace", () => {
            doTest("namespace Identifier {}", false);
        });

        it("should not have when a global module", () => {
            doTest("global {}", false);
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.getDeclarationKind), () => {
        function doTest(text: string, expected: ModuleDeclarationKind) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(text);
            expect(firstChild.getDeclarationKind()).to.equal(expected);
        }

        it("should be equal for namespace", () => {
            doTest("namespace Identifier {}", ModuleDeclarationKind.Namespace);
        });

        it("should be equal for module", () => {
            doTest("module Identifier {}", ModuleDeclarationKind.Module);
        });

        it("should be equal for global", () => {
            doTest("global {}", ModuleDeclarationKind.Global);
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.getDeclarationKindKeyword), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(text);
            const keyword = firstChild.getDeclarationKindKeyword();
            expect(keyword?.getText()).equals(expected);
        }

        it("should get the declaration kind keyword for a namespace", () => {
            doTest("namespace Identifier {}", "namespace");
        });

        it("should get the declaration kind keyword for a module", () => {
            doTest("module Identifier {}", "module");
        });

        it("should be undefined for global", () => {
            doTest("global {}", undefined);
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.setDeclarationKind), () => {
        function doTest(text: string, kind: ModuleDeclarationKind, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<ModuleDeclaration>(text);
            firstChild.setDeclarationKind(kind);
            expect(sourceFile.getFullText()).equals(expectedText);
        }

        it("should do nothing when the same", () => {
            doTest("module Identifier {}", ModuleDeclarationKind.Module, "module Identifier {}");
        });

        it("should change from module to namespace", () => {
            doTest("module Identifier {}", ModuleDeclarationKind.Namespace, "namespace Identifier {}");
        });

        it("should change from namespace to global", () => {
            doTest("namespace Identifier {}", ModuleDeclarationKind.Global, "global {}");
        });

        it("should change from module to global", () => {
            doTest("module Identifier {}", ModuleDeclarationKind.Global, "global {}");
        });

        it("should change from global to namespace", () => {
            doTest("global {}", ModuleDeclarationKind.Namespace, "namespace global {}");
        });

        it("should change from global to module", () => {
            doTest("global {}", ModuleDeclarationKind.Module, "module global {}");
        });
    });

    describe(nameof<ModuleDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: Partial<ModuleDeclarationStructure>, expectedCode: string) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(startingCode);
            firstChild.set(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("namespace Identifier {\n}", {}, "namespace Identifier {\n}");
        });

        it("should modify when changed", () => {
            const structure: OptionalKind<MakeRequired<ModuleDeclarationSpecificStructure>> = {
                declarationKind: ModuleDeclarationKind.Module,
            };
            doTest("namespace Identifier {\n}", structure, "module Identifier {\n}");
        });

        it("should ignore name when specifying global module", () => {
            doTest("namespace Identifier {\n}", { name: "NewName", declarationKind: ModuleDeclarationKind.Global }, "global {\n}");
        });

        it("should add a namespace keyword when specifying a name for a global module", () => {
            doTest("global {\n}", { name: "NewName" }, "namespace NewName {\n}");
        });

        it("should do nothing when specifying a new name of global for a global module", () => {
            doTest("global {\n}", { name: "global" }, "global {\n}");
        });
    });

    describe(nameof<ModuleDeclaration>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<ModuleDeclarationStructure>>) {
            const { firstChild } = getInfoFromText<ModuleDeclaration>(text);
            const structure = firstChild.getStructure();
            expect(structure).to.deep.equal(fillStructures.moduleDeclaration(expectedStructure));
        }

        it("should get when has nothing", () => {
            doTest("namespace Identifier {\n}", {
                kind: StructureKind.Module,
                declarationKind: ModuleDeclarationKind.Namespace,
                statements: [],
                docs: [],
                hasDeclareKeyword: false,
                isDefaultExport: false,
                isExported: false,
                name: "Identifier",
            });
        });

        it("should get when has everything", () => {
            const code = `
/** Test */
export declare module Identifier {
    const t = 5;
}`;
            doTest(code, {
                kind: StructureKind.Module,
                declarationKind: ModuleDeclarationKind.Module,
                statements: [fillStructures.variableStatement({
                    declarationKind: VariableDeclarationKind.Const,
                    declarations: [{
                        name: "t",
                        initializer: "5",
                    }],
                })],
                docs: [{ description: "Test" }],
                hasDeclareKeyword: true,
                isDefaultExport: false,
                isExported: true,
                name: "Identifier",
            });
        });

        it("should get for global module", () => {
            doTest("global {\n}", {
                kind: StructureKind.Module,
                declarationKind: ModuleDeclarationKind.Global,
                statements: [],
                docs: [],
                hasDeclareKeyword: false,
                isDefaultExport: false,
                isExported: false,
                name: "global",
            });
        });
    });

    describe(nameof<ModuleDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getModules()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the namespace declaration", () => {
            doTest("namespace I {}\n\nnamespace J {}\n\nnamespace K {}", 1, "namespace I {}\n\nnamespace K {}");
        });
    });
});
