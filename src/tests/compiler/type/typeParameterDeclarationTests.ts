import {expect} from "chai";
import {TypeParameterDeclaration, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypeParameterDeclaration), () => {
    describe(nameof<TypeParameterDeclaration>(d => d.getConstraintNode), () => {
        it("should return undefined when there's no constraint", () => {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function func<T>() {}\n");
            const typeParameterDeclaration = firstChild.getTypeParameterDeclarations()[0];
            expect(typeParameterDeclaration.getConstraintNode()).to.be.undefined;
        });

        it("should return the constraint type node when there's a constraint", () => {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function func<T extends string>() {}\n");
            const typeParameterDeclaration = firstChild.getTypeParameterDeclarations()[0];
            expect(typeParameterDeclaration.getConstraintNode()!.getText()).to.equal("string");
        });
    });
});
