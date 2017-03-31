import {expect} from "chai";
import {AmbientableNode, ClassDeclaration, InterfaceDeclaration, TypeAliasDeclaration, NamespaceDeclaration, PropertyDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(AmbientableNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("declare var ambientedVar; var myExplicitVar: string;");
    const statements = mainSourceFile.getVariableStatements();
    const ambientedStatement = statements[0];
    const notAmbientedStatement = statements[1];

    describe(nameof<AmbientableNode>(n => n.hasDeclareKeyword), () => {
        it("should have a declare keyword when it has one", () => {
            expect(ambientedStatement.hasDeclareKeyword()).to.be.true;
        });

        it("should not have an declare keyword when it doesn't have one", () => {
            expect(notAmbientedStatement.hasDeclareKeyword()).to.be.false;
        });
    });

    describe(nameof<AmbientableNode>(n => n.getDeclareKeyword), () => {
        it("should have an declare keyword when it has one", () => {
            expect(ambientedStatement.getDeclareKeyword()!.getText()).to.equal("declare");
        });

        it("should not have an declare keyword when it doesn't have one", () => {
            expect(notAmbientedStatement.getDeclareKeyword()).to.be.undefined;
        });
    });

    describe(nameof<AmbientableNode>(n => n.isAmbient), () => {
        it("should not be ambient when not", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            expect(firstChild.isAmbient()).to.be.false;
        });

        it("should be ambient when it has a declare keyword", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("declare class Identifier {}");
            expect(firstChild.isAmbient()).to.be.true;
        });

        it("should be ambient when it's in a definition file", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}", { isDefinitionFile: true });
            expect(firstChild.isAmbient()).to.be.true;
        });

        it("should be ambient when it's parent is ambient", () => {
            const {firstChild} = getInfoFromText<NamespaceDeclaration>("declare namespace Identifier { class Identifier {} }");
            const innerClass = firstChild.getClassDeclarations()[0];
            expect(innerClass.isAmbient()).to.be.true;
        });

        it("should always be ambient for interfaces", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {}");
            expect(firstChild.isAmbient()).to.be.true;
        });

        it("should always be ambient for type aliases", () => {
            const {firstChild} = getInfoFromText<TypeAliasDeclaration>("type Identifier = string;");
            expect(firstChild.isAmbient()).to.be.true;
        });
    });

    describe(nameof<AmbientableNode>(n => n.toggleDeclareKeyword), () => {
        it("should add declare keyword when doesn't have one", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass { }");
            firstChild.toggleDeclareKeyword();
            expect(sourceFile.getText()).to.equal("declare class MyClass { }");
        });

        it("should remove declare keyword when it has one", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("declare class MyClass { }");
            firstChild.toggleDeclareKeyword();
            expect(sourceFile.getText()).to.equal("class MyClass { }");
        });

        it("should add declare keyword when explicitly toggling it", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass { }");
            firstChild.toggleDeclareKeyword(true);
            expect(sourceFile.getText()).to.equal("declare class MyClass { }");
        });

        it("should set as not readonly when readonly", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass { readonly prop: string; }");
            (firstChild.getInstanceProperties()[0] as PropertyDeclaration).setIsReadonly(false);
            expect(sourceFile.getText()).to.equal("class MyClass { prop: string; }");
        });
    });
});
