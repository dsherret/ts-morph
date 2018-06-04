import { expect } from "chai";
import { FunctionDeclaration, TypeParameterDeclaration } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(TypeParameterDeclaration), () => {
    function getTypeParameterFromText(text: string, index = 0) {
        const {firstChild} = getInfoFromText<FunctionDeclaration>(text);
        return firstChild.getTypeParameters()[index];
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

    describe(nameof<TypeParameterDeclaration>(d => d.getDefaultNode), () => {
        it("should return undefined when there's no default node", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T>() {}\n");
            expect(typeParameterDeclaration.getDefaultNode()).to.be.undefined;
        });

        it("should return the default type node when there's a default", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T = string>() {}\n");
            expect(typeParameterDeclaration.getDefaultNode()!.getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.remove), () => {
        function doTest(startText: string, indexToRemove: number, expectedText: string) {
            const typeParameterDeclaration = getTypeParameterFromText(startText, indexToRemove);
            const {sourceFile} = typeParameterDeclaration;

            typeParameterDeclaration.remove();

            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove when its the only type parameter", () => {
            doTest("function func<T>() {}", 0, "function func() {}");
        });

        it("should remove when it's the first type parameter", () => {
            doTest("function func<T, U>() {}", 0, "function func<U>() {}");
        });

        it("should remove when it's the middle type parameter", () => {
            doTest("function func<T, U, V>() {}", 1, "function func<T, V>() {}");
        });

        it("should remove when it's the last type parameter", () => {
            doTest("function func<T, U>() {}", 1, "function func<T>() {}");
        });

        it("should remove when it has a constraint", () => {
            doTest("function func<T extends Other, U>() {}", 0, "function func<U>() {}");
        });
    });
});
