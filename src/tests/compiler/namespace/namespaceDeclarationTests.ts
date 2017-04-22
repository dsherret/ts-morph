import {expect} from "chai";
import {NamespaceDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(NamespaceDeclaration), () => {
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

    describe(nameof<NamespaceDeclaration>(d => d.getDeclarationTypeKeyword), () => {
        it("should get the declaration type keyword for a namespace", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            expect(firstChild.getDeclarationTypeKeyword()!.getText()).equals("namespace");
        });

        it("should get the declaration type keyword for a module", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            expect(firstChild.getDeclarationTypeKeyword()!.getText()).equals("module");
        });
    });

    describe(nameof<NamespaceDeclaration>(d => d.setHasNamespaceKeyword), () => {
        it("should change the declaration type when a module", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            firstChild.setHasNamespaceKeyword();
            expect(sourceFile.getText()).equals("namespace Identifier {}");
        });

        it("should change the declaration type when a namespace", () => {
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
        it("should change the declaration type when a namespace", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("namespace Identifier {}");
            firstChild.setHasModuleKeyword();
            expect(sourceFile.getText()).equals("module Identifier {}");
        });

        it("should change the declaration type when a module", () => {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>("module Identifier {}");
            firstChild.setHasModuleKeyword(false);
            expect(sourceFile.getText()).equals("namespace Identifier {}");
        });

    });
});
