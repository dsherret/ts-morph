import { expect } from "chai";
import { NamespaceDeclaration } from "../../../compiler";
import * as errors from "../../../errors";
import { NamespaceDeclarationSpecificStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(NamespaceDeclaration), () => {
    describe(nameof<NamespaceDeclaration>(d => d.getName), () => {
        function doTest(text: string, expectedName: string) {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>(text);
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
            const {firstChild} = getInfoFromText<NamespaceDeclaration>(text);
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
        it("should rename a namespace that doesn't use dot notation", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace {}");
            firstChild.rename("NewName");
            expect(firstChild.getFullText()).to.equal("namespace NewName {}");
        });

        it("should throw an exception when passing in a name with a period", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace {}");
            expect(() => firstChild.rename("NewName.Inner")).to.throw(errors.NotSupportedError);
        });

        it("should throw an exception when renaming a namespace whose name uses dot notation", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace.MyInner {}");
            expect(() => firstChild.rename("NewName")).to.throw(errors.NotSupportedError);
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.setName), () => {
        it("should throw an exception when using dot notation because it's not implemented", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace {}");
            expect(() => firstChild.setName("NewName.NewName")).to.throw(errors.NotImplementedError);
        });

        it("should throw an exception when setting a namepsace name that already uses dot notation because it's not implemented", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace.Name {}");
            expect(() => firstChild.setName("NewName")).to.throw(errors.NotImplementedError);
        });

        it("should set the name when not using dot notation", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace MyNamespace {}");
            firstChild.setName("NewName");
            expect(firstChild.getText()).to.equal("namespace NewName {}");
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.hasNamespaceKeyword), () => {
        it("should have a namespace keyword when it has one", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            expect(firstChild.hasNamespaceKeyword()).is.true;
        });

        it("should not have a namespace keyword when it doesn't have one", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            expect(firstChild.hasNamespaceKeyword()).is.false;
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.hasModuleKeyword), () => {
        it("should have a module keyword when it has one", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            expect(firstChild.hasModuleKeyword()).is.true;
        });

        it("should not have a module keyword when it doesn't have one", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            expect(firstChild.hasModuleKeyword()).is.false;
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.getDeclarationKindKeyword), () => {
        it("should get the declaration kind keyword for a namespace", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            expect(firstChild.getDeclarationKindKeyword()!.getText()).equals("namespace");
        });

        it("should get the declaration kind keyword for a module", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            expect(firstChild.getDeclarationKindKeyword()!.getText()).equals("module");
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.setHasNamespaceKeyword), () => {
        it("should change the declaration kind when a module", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            firstChild.setHasNamespaceKeyword();
            expect(sourceFile.getText()).equals("namespace Identifier {}");
        });

        it("should change the declaration kind when a namespace", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            firstChild.setHasNamespaceKeyword(false);
            expect(sourceFile.getText()).equals("module Identifier {}");
        });

        it("should do nothing when the same", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            firstChild.setHasNamespaceKeyword(true);
            expect(sourceFile.getText()).equals("namespace Identifier {}");
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.setHasModuleKeyword), () => {
        it("should change the declaration kind when a namespace", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            firstChild.setHasModuleKeyword();
            expect(sourceFile.getText()).equals("module Identifier {}");
        });

        it("should change the declaration kind when a module", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            firstChild.setHasModuleKeyword(false);
            expect(sourceFile.getText()).equals("namespace Identifier {}");
        });
    });

    describe(nameof<NamespaceDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: NamespaceDeclarationSpecificStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("namespace Identifier {\n}", {}, "namespace Identifier {\n}");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<NamespaceDeclarationSpecificStructure> = {
                hasModuleKeyword: true
            };
            doTest("namespace Identifier {\n}", structure, "module Identifier {\n}");
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getNamespaces()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the namespace declaration", () => {
            doTest("namespace I {}\n\nnamespace J {}\n\nnamespace K {}", 1, "namespace I {}\n\nnamespace K {}");
        });
    });
});
