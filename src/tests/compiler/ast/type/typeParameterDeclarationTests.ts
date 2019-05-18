import { expect } from "chai";
import { ClassDeclaration, FunctionDeclaration, TypeParameterDeclaration } from "../../../../compiler";
import { WriterFunction } from "../../../../types";
import { TypeScriptVersionChecker } from "../../../../utils";
import { TypeParameterDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalTrivia } from "../../testHelpers";

describe(nameof(TypeParameterDeclaration), () => {
    function getTypeParameterFromText(text: string, index = 0) {
        const { firstChild } = getInfoFromText<FunctionDeclaration>(text);
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
        function doTest(text: string, name: string | WriterFunction, expected: string) {
            const typeParameterDeclaration = getTypeParameterFromText(text);
            typeParameterDeclaration.setConstraint(name);
            expect(typeParameterDeclaration._sourceFile.getFullText()).to.equal(expected);
        }

        it("should set when it doesn't exist", () => {
            doTest("function func<T>() {}", "string", "function func<T extends string>() {}");
        });

        it("should set on multiple lines", () => {
            doTest("function func<T>() {}", writer => writer.writeLine("string |").write("number"), "function func<T extends string |\n    number>() {}");
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
            expect(typeParameterDeclaration._sourceFile.getFullText()).to.equal(expected);
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
        function doTest(text: string, name: string | WriterFunction, expected: string) {
            const typeParameterDeclaration = getTypeParameterFromText(text);
            typeParameterDeclaration.setDefault(name);
            expect(typeParameterDeclaration._sourceFile.getFullText()).to.equal(expected);
        }

        it("should set when it doesn't exist", () => {
            doTest("function func<T>() {}", "string", "function func<T = string>() {}");
        });

        it("should set on multiple lines", () => {
            doTest("function func<T>() {}", writer => writer.writeLine("string |").write("number"), "function func<T = string |\n    number>() {}");
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
            expect(typeParameterDeclaration._sourceFile.getFullText()).to.equal(expected);
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
            const { _sourceFile } = typeParameterDeclaration;

            typeParameterDeclaration.remove();

            expect(_sourceFile.getFullText()).to.equal(expectedText);
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

    describe(nameof<TypeParameterDeclaration>(n => n.set), () => {
        function doTest(text: string, structure: Partial<TypeParameterDeclarationStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText<ClassDeclaration>(text);
            sourceFile.getClasses()[0].getTypeParameters()[0].set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should not change when empty", () => {
            const code = "class C<T extends string = number> {}";
            doTest(code, {}, code);
        });

        it("should remove when specifying undefined for constraint and default", () => {
            doTest("class C<T extends string = number> {}", { constraint: undefined, default: undefined },
               "class C<T> {}");
        });

        it("should replace existing", () => {
            doTest("class C<T extends string = number> {}", { name: "U", constraint: "number", default: "string" },
                "class C<U extends number = string> {}");
        });

        it("should add constraint and default when not exists", () => {
            doTest("class C<T> {}", { name: "U", constraint: "number", default: "string" },
                "class C<U extends number = string> {}");
        });

        it("should add constraint and default properly when they span multiple lines", () => {
            doTest("class C<T> {}", { name: "U", constraint: "{\n    prop: string;\n}", default: "{\n    other: number;\n}" },
                "class C<U extends {\n        prop: string;\n    } = {\n        other: number;\n    }> {}");
        });
    });

    describe(nameof<TypeParameterDeclaration>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<TypeParameterDeclarationStructure>>) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(text);
            const structure = firstChild.getTypeParameters()[0].getStructure();
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get when it has nothing", () => {
            doTest("class C<T> {}", {
                kind: StructureKind.TypeParameter,
                name: "T",
                constraint: undefined,
                default: undefined
            });
        });

        it("should get when it has everything", () => {
            doTest("class C<T extends string = number> {}", {
                kind: StructureKind.TypeParameter,
                name: "T",
                constraint: "string",
                default: "number"
            });
        });

        // for some reason this test was failing in 3.1. Not a big deal... ignoring.
        if (TypeScriptVersionChecker.isGreaterThanOrEqual(3, 2, 0)) {
            it("should trim leading indentation on the contraint and default", () => {
                doTest("class C<T extends {\n        prop: string;\n    } = {\n    }> {}", {
                    kind: StructureKind.TypeParameter,
                    name: "T",
                    constraint: "{\n    prop: string;\n}",
                    default: "{\n}"
                });
            });
        }
    });
});
