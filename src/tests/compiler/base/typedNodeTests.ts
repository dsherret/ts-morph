import {expect} from "chai";
import {TypedNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypedNode), () => {
    const {sourceFile: variablesSourceFile} = getInfoFromText("var myImplicitVar = 1; var myExplicitVar: string;");
    const implicitVarDeclaration = variablesSourceFile.getVariableStatements()[0].getDeclarationList().getDeclarations()[0];
    const explicitVarDeclaration = variablesSourceFile.getVariableStatements()[1].getDeclarationList().getDeclarations()[0];

    describe(nameof<TypedNode>(n => n.getType), () => {
        describe("getting an implicit type", () => {
            it("should have the expected implicit type", () => {
                expect(implicitVarDeclaration.getType().getText()).to.equal("number");
            });
        });

        describe("getting an explicit type", () => {
            it("should have the expected explicit type", () => {
                expect(explicitVarDeclaration.getType().getText()).to.equal("string");
            });
        });
    });

    describe(nameof<TypedNode>(n => n.getTypeNode), () => {
        describe("getting an implicit type", () => {
            it("should return undefined", () => {
                expect(implicitVarDeclaration.getTypeNode()).to.be.undefined;
            });
        });

        describe("getting an explicit type", () => {
            it("should get the expected explicit type", () => {
                expect(explicitVarDeclaration.getTypeNode()!.getText()).to.equal("string");
            });
        });
    });
});
