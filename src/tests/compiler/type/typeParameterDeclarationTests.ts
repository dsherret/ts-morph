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

    describe(nameof<TypeParameterDeclaration>(d => d.getConstraint), () => {
        it("should return undefined when there's no constraint", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T>() {}\n");
            expect(typeParameterDeclaration.getConstraint()).to.be.undefined;
        });

        it("should return the constraint type node when there's a constraint", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T extends string>() {}\n");
            expect(typeParameterDeclaration.getConstraint()!.getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.getConstraintOrThrow), () => {
        it("should throw when there's no constraint", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T>() {}\n");
            expect(() => typeParameterDeclaration.getConstraintOrThrow()).to.throw();
        });

        it("should return the constraint type node when there's a constraint", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T extends string>() {}\n");
            expect(typeParameterDeclaration.getConstraintOrThrow().getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.setConstraint), () => {
        function doTest(text: string, name: string, expected: string) {
            const typeParameterDeclaration = getTypeParameterFromText(text);
            typeParameterDeclaration.setConstraint(name);
            expect(typeParameterDeclaration.sourceFile.getFullText()).to.equal(expected);
        }

        it("should set when it doesn't exist", () => {
            doTest("function func<T>() {}", "string", "function func<T extends string>() {}");
        });

        it("should set when it exists", () => {
            doTest("function func<T extends number>() {}", "string", "function func<T extends string>() {}");
        });

        it("should remove when passing in an empty string", () => {
            doTest("function func<T extends number>() {}", "", "function func<T>() {}");
        });

        it("should set when it has a default exists", () => {
            doTest("function func<T = number>() {}", "string", "function func<T extends string = number>() {}");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.removeConstraint), () => {
        function doTest(text: string, expected: string) {
            const typeParameterDeclaration = getTypeParameterFromText(text);
            typeParameterDeclaration.removeConstraint();
            expect(typeParameterDeclaration.sourceFile.getFullText()).to.equal(expected);
        }

        it("should do nothing when it doesn't exist", () => {
            doTest("function func<T = string>() {}", "function func<T = string>() {}");
        });

        it("should remove when it exists", () => {
            doTest("function func<T extends string>() {}", "function func<T>() {}");
        });

        it("should remove when it and a default exists", () => {
            doTest("function func<T extends string = string>() {}", "function func<T = string>() {}");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.getDefault), () => {
        it("should return undefined when there's no default node", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T>() {}\n");
            expect(typeParameterDeclaration.getDefault()).to.be.undefined;
        });

        it("should return the default type node when there's a default", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T = string>() {}\n");
            expect(typeParameterDeclaration.getDefault()!.getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.getDefault), () => {
        it("should throw when there's no default node", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T>() {}\n");
            expect(() => typeParameterDeclaration.getDefaultOrThrow()).to.throw();
        });

        it("should return the default type node when there's a default", () => {
            const typeParameterDeclaration = getTypeParameterFromText("function func<T = string>() {}\n");
            expect(typeParameterDeclaration.getDefaultOrThrow().getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.setDefault), () => {
        function doTest(text: string, name: string, expected: string) {
            const typeParameterDeclaration = getTypeParameterFromText(text);
            typeParameterDeclaration.setDefault(name);
            expect(typeParameterDeclaration.sourceFile.getFullText()).to.equal(expected);
        }

        it("should set when it doesn't exist", () => {
            doTest("function func<T>() {}", "string", "function func<T = string>() {}");
        });

        it("should set when it exists", () => {
            doTest("function func<T = number>() {}", "string", "function func<T = string>() {}");
        });

        it("should remove when passing in an empty string", () => {
            doTest("function func<T = number>() {}", "", "function func<T>() {}");
        });

        it("should set when it has a constraint exists", () => {
            doTest("function func<T extends number>() {}", "string", "function func<T extends number = string>() {}");
        });
    });

    describe(nameof<TypeParameterDeclaration>(d => d.removeDefault), () => {
        function doTest(text: string, expected: string) {
            const typeParameterDeclaration = getTypeParameterFromText(text);
            typeParameterDeclaration.removeDefault();
            expect(typeParameterDeclaration.sourceFile.getFullText()).to.equal(expected);
        }

        it("should do nothing when it doesn't exist", () => {
            doTest("function func<T extends string>() {}", "function func<T extends string>() {}");
        });

        it("should remove when it exists", () => {
            doTest("function func<T = string>() {}", "function func<T>() {}");
        });

        it("should remove when it and a constraint exists", () => {
            doTest("function func<T extends string = string>() {}", "function func<T extends string>() {}");
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
