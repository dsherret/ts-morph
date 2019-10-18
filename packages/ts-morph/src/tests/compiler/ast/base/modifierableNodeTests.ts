import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, ModifierableNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ModifierableNode), () => {
    describe(nameof<ModifierableNode>(n => n.getFirstModifierByKind), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        it("should return the modifier when it exists", () => {
            expect(firstChild.getFirstModifierByKind(SyntaxKind.ExportKeyword)).to.not.be.undefined;
        });

        it("should return undefined when the modifier doesn't exist", () => {
            expect(firstChild.getFirstModifierByKind(SyntaxKind.AbstractKeyword)).to.be.undefined;
        });
    });

    describe(nameof<ModifierableNode>(n => n.getFirstModifierByKindOrThrow), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        it("should return the modifier when it exists", () => {
            expect(firstChild.getFirstModifierByKindOrThrow(SyntaxKind.ExportKeyword)).to.not.be.undefined;
        });

        it("should return undefined when the modifier doesn't exist", () => {
            expect(() => firstChild.getFirstModifierByKindOrThrow(SyntaxKind.AbstractKeyword)).to.throw();
        });
    });

    describe(nameof<ModifierableNode>(n => n.hasModifier), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        describe("providing string", () => {
            it("should be true when it does", () => {
                expect(firstChild.hasModifier("export")).to.be.true;
            });

            it("should be false when it doesn't", () => {
                expect(firstChild.hasModifier("abstract")).to.be.false;
            });
        });

        describe("providing syntax kind", () => {
            it("should be true when it does", () => {
                expect(firstChild.hasModifier(SyntaxKind.ExportKeyword)).to.be.true;
            });

            it("should be false when it doesn't", () => {
                expect(firstChild.hasModifier(SyntaxKind.AbstractKeyword)).to.be.false;
            });
        });
    });

    describe(nameof<ModifierableNode>(n => n.getModifiers), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export abstract class Identifier {}");
        const modifiers = firstChild.getModifiers();

        it("should get all the modifiers", () => {
            expect(modifiers.length).to.equal(2);
        });

        it("should get the right modifiers", () => {
            expect(modifiers[0].getKind()).to.equal(SyntaxKind.ExportKeyword);
            expect(modifiers[1].getKind()).to.equal(SyntaxKind.AbstractKeyword);
        });
    });

    describe(nameof<ModifierableNode>(n => n.addModifier), () => {
        it("should add a modifier in the correct order in a simple scenario", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.addModifier("abstract");
            firstChild.addModifier("export");
            expect(firstChild.getText()).to.equal("export abstract class Identifier {}");
        });

        it("should add a modifier in the correct order in an advanced scenario", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.addModifier("export");
            firstChild.addModifier("abstract");
            firstChild.addModifier("declare");
            expect(firstChild.getText()).to.equal("export declare abstract class Identifier {}");
        });

        it("should not add the same modifier twice", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.addModifier("export");
            firstChild.addModifier("export");
            expect(firstChild.getText()).to.equal("export class Identifier {}");
        });

        it("should add when there's a decorator", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("@dec class Identifier {}");
            firstChild.addModifier("export");
            expect(firstChild.getText()).to.equal("@dec export class Identifier {}");
        });

        it("should add when there's a js doc", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("/** Test */ class Identifier {}");
            firstChild.addModifier("export");
            expect(firstChild.getFullText()).to.equal("/** Test */ export class Identifier {}");
        });
    });

    describe(nameof<ModifierableNode>(n => n.toggleModifier), () => {
        it("should add a modifier when toggling on", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.toggleModifier("export");
            expect(firstChild.getText()).to.equal("export class Identifier {}");
        });

        it("should remove the modifier when toggling off", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier {}");
            firstChild.toggleModifier("export");
            expect(firstChild.getText()).to.equal("class Identifier {}");
        });

        it("should use the value for toggling that's provided when toggling on and on", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier {}");
            firstChild.toggleModifier("export", true);
            expect(firstChild.getText()).to.equal("export class Identifier {}");
        });

        it("should use the value for toggling that's provided when toggling on and off", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.toggleModifier("export", true);
            expect(firstChild.getText()).to.equal("export class Identifier {}");
        });

        it("should use the value for toggling that's provided when toggling off and on", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier {}");
            firstChild.toggleModifier("export", false);
            expect(firstChild.getText()).to.equal("class Identifier {}");
        });

        it("should use the value for toggling that's provided when toggling off and off", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.toggleModifier("export", false);
            expect(firstChild.getText()).to.equal("class Identifier {}");
        });

        it("should not remove jsdoc comment", () => {
            const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>("/** test */declare function Test {}");
            firstChild.toggleModifier("declare", false);
            expect(sourceFile.getFullText()).to.equal("/** test */function Test {}");
        });

        it("should not remove comment", () => {
            const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>("// test\ndeclare function Test {}");
            firstChild.toggleModifier("declare", false);
            expect(sourceFile.getFullText()).to.equal("// test\nfunction Test {}");
        });
    });
});
