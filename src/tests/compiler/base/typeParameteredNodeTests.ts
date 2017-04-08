import {expect} from "chai";
import {TypeParameteredNode, TypeParameterDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypeParameteredNode), () => {
    const {sourceFile} = getInfoFromText("function noTypeParamsFunc() {}\n function typeParamsFunc<T, U>() {}");
    const noTypeParamsFunc = sourceFile.getFunctions()[0];
    const typeParamsFunc = sourceFile.getFunctions()[1];

    describe(nameof<TypeParameteredNode>(n => n.getTypeParameterDeclarations), () => {
        describe("having no type parameters", () => {
            it("should return an empty array", () => {
                expect(noTypeParamsFunc.getTypeParameterDeclarations().length).to.equal(0);
            });
        });

        describe("having type parameters", () => {
            it("should get the correct number of type parameters", () => {
                expect(typeParamsFunc.getTypeParameterDeclarations().length).to.equal(2);
            });

            it("should have the right instance of", () => {
                expect(typeParamsFunc.getTypeParameterDeclarations()[0]).to.be.instanceOf(TypeParameterDeclaration);
            });
        });
    });
});
