import {expect} from "chai";
import * as ts from "typescript";
import {ModifierableNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ModifierableNode), () => {
    describe(nameof<ModifierableNode>(n => n.getCombinedModifierFlags), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        it("should get the combined modifier flags", () => {
            expect(firstChild.getCombinedModifierFlags()).to.equal(ts.ModifierFlags.Export);
        });
    });

    describe(nameof<ModifierableNode>(n => n.getFirstModifierByKind), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        it("should return the modifier when it exists", () => {
            expect(firstChild.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword)).to.not.be.undefined;
        });

        it("should return undefined when the modifier doesn't exist", () => {
            expect(firstChild.getFirstModifierByKind(ts.SyntaxKind.AbstractKeyword)).to.be.undefined;
        });
    });

    describe(nameof<ModifierableNode>(n => n.getModifiers), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export abstract class Identifier {}");
        const modifiers = firstChild.getModifiers();

        it("should get all the modifiers", () => {
            expect(modifiers.length).to.equal(2);
        });

        it("should get the right modifiers", () => {
            expect(modifiers[0].getKind()).to.equal(ts.SyntaxKind.ExportKeyword);
            expect(modifiers[1].getKind()).to.equal(ts.SyntaxKind.AbstractKeyword);
        });
    });

    describe(nameof<ModifierableNode>(n => n.addModifier), () => {
        it("should add a modifier in the correct order in a simple scenario", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.addModifier("abstract");
            firstChild.addModifier("export");
            expect(firstChild.getText()).to.equal("export abstract class Identifier {}");
        });

        it("should add a modifier in the correct order in an advanced scenario", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.addModifier("export");
            firstChild.addModifier("abstract");
            firstChild.addModifier("declare");
            expect(firstChild.getText()).to.equal("export declare abstract class Identifier {}");
        });

        it("should not add the same modifier twice", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.addModifier("export");
            firstChild.addModifier("export");
            expect(firstChild.getText()).to.equal("export class Identifier {}");
        });
    });
});
