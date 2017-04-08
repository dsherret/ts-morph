import {expect} from "chai";
import {ReturnTypedNode, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ReturnTypedNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("function myImplicit() { return 5; }\nfunction myExplicit(): string { return ''; }");
    const implicitDeclaration = mainSourceFile.getFunctions()[0];
    const explicitDeclaration = mainSourceFile.getFunctions()[1];

    describe(nameof<ReturnTypedNode>(n => n.getReturnType), () => {
        it("should get the expected implicit type", () => {
            expect(implicitDeclaration.getReturnType().getText()).to.equal("number");
        });

        it("should get the expected explicit type", () => {
            expect(explicitDeclaration.getReturnType().getText()).to.equal("string");
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.getReturnTypeNode), () => {
        it("should return undefined for an implicit type", () => {
            expect(implicitDeclaration.getReturnTypeNode()).to.be.undefined;
        });

        it("should get the expected explicit type for an explicit type", () => {
            expect(explicitDeclaration.getReturnTypeNode()!.getText()).to.equal("string");
        });
    });

    describe(nameof<ReturnTypedNode>(n => n.setReturnType), () => {
        it("should set the return type when none exists", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function identifier() {}");
            firstChild.setReturnType("string");
            expect(firstChild.getText()).to.equal("function identifier(): string {}");
        });

        it("should set the return type when one already exists", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function identifier(): number {}");
            firstChild.setReturnType("string");
            expect(firstChild.getText()).to.equal("function identifier(): string {}");
        });

        it("should set the return type for an ambient declaration with no return type", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("declare function identifier();");
            firstChild.setReturnType("string");
            expect(firstChild.getText()).to.equal("declare function identifier(): string;");
        });

        it("should set the return type for an ambient declaration", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("declare function identifier(): number;");
            firstChild.setReturnType("string");
            expect(firstChild.getText()).to.equal("declare function identifier(): string;");
        });
    });
});
