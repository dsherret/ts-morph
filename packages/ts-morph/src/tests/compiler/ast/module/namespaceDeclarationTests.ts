import { expect } from "chai";
import { NamespaceDeclaration, NamespaceDeclarationKind, VariableDeclarationKind } from "../../../../compiler";
import { errors } from "@ts-morph/common";
import { NamespaceDeclarationStructure, NamespaceDeclarationSpecificStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, fillStructures, OptionalTrivia } from "../../testHelpers";

describe(nameof(NamespaceDeclaration), () => {
    describe(nameof<NamespaceDeclaration>(d => d.getName), () => {
        function doTest(text: string, expectedName: string) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
            expect(firstChild.getName()).to.equal(expectedName);
        }

        it("should get the name when not using dot notation", () => {
            doTest("namespace MyNamespace {}", "MyNamespace");
        });

        it("should get the name when using dot notation", () => {
            doTest("namespace MyNamespace.Inner.MoreInner {}", "MyNamespace.Inner.MoreInner");
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.getNameNodes), () => {
        function doTest(text: string, expectedNames: string[]) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
            expect(firstChild.getNameNodes().map(n => n.getText())).to.deep.equal(expectedNames);
        }

        it("should get the name nodes when not using dot notation", () => {
            doTest("namespace MyNamespace {}", ["MyNamespace"]);
        });

        it("should get the name nodes when using dot notation", () => {
            doTest("namespace MyNamespace.Inner.MoreInner {}", ["MyNamespace", "Inner", "MoreInner"]);
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.rename), () => {
        function doTest(text: string, newName: string, expectedText: string) {
            const { sourceFile, firstChild } = getInfoFromText<NamespaceDeclaration>(text);
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
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace {}");
            expect(() => firstChild.rename("NewName.Inner")).to.throw(errors.NotSupportedError);
        });

        it("should throw an exception when renaming a namespace whose name uses dot notation", () => {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace.MyInner {}");
            expect(() => firstChild.rename("NewName")).to.throw(errors.NotSupportedError);
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.setName), () => {
        function doTest(text: string, newName: string, expectedText: string) {
            const { sourceFile, firstChild } = getInfoFromText<NamespaceDeclaration>(text);
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
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace {}");
            expect(() => firstChild.setName("NewName.NewName")).to.throw(errors.NotImplementedError);
        });

        it("should throw an exception when setting a namepsace name that already uses dot notation because it's not implemented", () => {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace.Name {}");
            expect(() => firstChild.setName("NewName")).to.throw(errors.NotImplementedError);
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.hasNamespaceKeyword), () => {
        function doTest(text: string, expected: boolean) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
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

    describe(nameof<NamespaceDeclaration>(d => d.hasModuleKeyword), () => {
        function doTest(text: string, expected: boolean) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
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

    describe(nameof<NamespaceDeclaration>(d => d.getDeclarationKind), () => {
        function doTest(text: string, expected: NamespaceDeclarationKind) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
            expect(firstChild.getDeclarationKind()).to.equal(expected);
        }

        it("should be equal for namespace", () => {
            doTest("namespace Identifier {}", NamespaceDeclarationKind.Namespace);
        });

        it("should be equal for module", () => {
            doTest("module Identifier {}", NamespaceDeclarationKind.Module);
        });

        it("should be equal for global", () => {
            doTest("global {}", NamespaceDeclarationKind.Global);
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.getDeclarationKindKeyword), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
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

    describe(nameof<NamespaceDeclaration>(d => d.setDeclarationKind), () => {
        function doTest(text: string, kind: NamespaceDeclarationKind, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<NamespaceDeclaration>(text);
            firstChild.setDeclarationKind(kind);
            expect(sourceFile.getFullText()).equals(expectedText);
        }

        it("should do nothing when the same", () => {
            doTest("module Identifier {}", NamespaceDeclarationKind.Module, "module Identifier {}");
        });

        it("should change from module to namespace", () => {
            doTest("module Identifier {}", NamespaceDeclarationKind.Namespace, "namespace Identifier {}");
        });

        it("should change from namespace to global", () => {
            doTest("namespace Identifier {}", NamespaceDeclarationKind.Global, "global {}");
        });

        it("should change from module to global", () => {
            doTest("module Identifier {}", NamespaceDeclarationKind.Global, "global {}");
        });

        it("should change from global to namespace", () => {
            doTest("global {}", NamespaceDeclarationKind.Namespace, "namespace global {}");
        });

        it("should change from global to module", () => {
            doTest("global {}", NamespaceDeclarationKind.Module, "module global {}");
        });
    });

    describe(nameof<NamespaceDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: Partial<NamespaceDeclarationStructure>, expectedCode: string) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(startingCode);
            firstChild.set(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("namespace Identifier {\n}", {}, "namespace Identifier {\n}");
        });

        it("should modify when changed", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<NamespaceDeclarationSpecificStructure>> = {
                declarationKind: NamespaceDeclarationKind.Module
            };
            doTest("namespace Identifier {\n}", structure, "module Identifier {\n}");
        });

        it("should ignore name when specifying global module", () => {
            doTest("namespace Identifier {\n}", { name: "NewName", declarationKind: NamespaceDeclarationKind.Global }, "global {\n}");
        });

        it("should add a namespace keyword when specifying a name for a global module", () => {
            doTest("global {\n}", { name: "NewName" }, "namespace NewName {\n}");
        });

        it("should do nothing when specifying a new name of global for a global module", () => {
            doTest("global {\n}", { name: "global" }, "global {\n}");
        });
    });

    describe(nameof<NamespaceDeclaration>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<NamespaceDeclarationStructure>>) {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
            const structure = firstChild.getStructure();
            expect(structure).to.deep.equal(fillStructures.namespaceDeclaration(expectedStructure));
        }

        it("should get when has nothing", () => {
            doTest("namespace Identifier {\n}", {
                kind: StructureKind.Namespace,
                declarationKind: NamespaceDeclarationKind.Namespace,
                statements: [],
                docs: [],
                hasDeclareKeyword: false,
                isDefaultExport: false,
                isExported: false,
                name: "Identifier"
            });
        });

        it("should get when has everything", () => {
            const code = `
/** Test */
export declare module Identifier {
    const t = 5;
}`;
            doTest(code, {
                kind: StructureKind.Namespace,
                declarationKind: NamespaceDeclarationKind.Module,
                statements: [fillStructures.variableStatement({
                    declarationKind: VariableDeclarationKind.Const,
                    declarations: [{
                        name: "t",
                        initializer: "5"
                    }]
                })],
                docs: [{ description: "Test" }],
                hasDeclareKeyword: true,
                isDefaultExport: false,
                isExported: true,
                name: "Identifier"
            });
        });

        it("should get for global module", () => {
            doTest("global {\n}", {
                kind: StructureKind.Namespace,
                declarationKind: NamespaceDeclarationKind.Global,
                statements: [],
                docs: [],
                hasDeclareKeyword: false,
                isDefaultExport: false,
                isExported: false,
                name: "global"
            });
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getNamespaces()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the namespace declaration", () => {
            doTest("namespace I {}\n\nnamespace J {}\n\nnamespace K {}", 1, "namespace I {}\n\nnamespace K {}");
        });
    });
});
