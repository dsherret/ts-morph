import {expect} from "chai";
import {ReturnTypedNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ReturnTypedNode), () => {
    const {sourceFile} = getInfoFromText("function myImplicit() { return 5; }\nfunction myExplicit(): string { return ''; }");
    const implicitDeclaration = sourceFile.getFunctionDeclarations()[0];
    const explicitDeclaration = sourceFile.getFunctionDeclarations()[1];

    describe(nameof<ReturnTypedNode>(n => n.getReturnType), () => {
        describe("getting an implicit type", () => {
            it("should have the expected implicit type", () => {
                expect(implicitDeclaration.getReturnType().getText()).to.equal("number");
            });
        });

        describe("getting an explicit type", () => {
            it("should have the expected explicit type", () => {
                expect(explicitDeclaration.getReturnType().getText()).to.equal("string");
            });
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.getReturnTypeNode), () => {
        describe("getting an implicit type", () => {
            it("should return undefined", () => {
                expect(implicitDeclaration.getReturnTypeNode()).to.be.undefined;
            });
        });

        describe("getting an explicit type", () => {
            it("should get the expected explicit type", () => {
                expect(explicitDeclaration.getReturnTypeNode()!.getText()).to.equal("string");
            });
        });
    });
});
