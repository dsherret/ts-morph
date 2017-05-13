import {expect} from "chai";
import {TypeParameterDeclaration, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypeParameterDeclaration), () => {
    function getTypeParameterFromText(text: string) {
        const {firstChild} = getInfoFromText<FunctionDeclaration>(text);
        return firstChild.getTypeParameters()[0];
    }

    describe(nameof<TypeParameterDeclaration>(d => d.getName), () => {
        it("should get the name", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T>() {}\n");
            expect(typeParameterDeclaration.getName()).to.equal("T");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.getConstraintNode), () => {
        it("should return undefined when there's no constraint", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T>() {}\n");
            expect(typeParameterDeclaration.getConstraintNode()).to.be.undefined;
        });

        it("should return the constraint type node when there's a constraint", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T extends string>() {}\n");
            expect(typeParameterDeclaration.getConstraintNode()!.getText()).to.equal("string");
        });
    });
});
