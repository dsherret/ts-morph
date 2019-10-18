import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, MethodDeclaration, Scope } from "../../../../compiler";
import { MethodDeclarationOverloadStructure, MethodDeclarationSpecificStructure, MethodDeclarationStructure, StructureKind,
    OptionalKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

describe(nameof(MethodDeclaration), () => {
    describe(nameof<MethodDeclaration>(f => f.insertOverloads), () => {
        function doTest(
            startCode: string,
            index: number,
            structures: OptionalKind<MethodDeclarationOverloadStructure>[],
            expectedCode: string,
            methodIndex = 0
        ) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getMembers()[methodIndex] as MethodDeclaration;
            const result = methodDeclaration.insertOverloads(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when no other overloads exist", () => {
            doTest("class Identifier {\n    identifier() {}\n }", 0, [{ returnType: "number" }, {}],
                "class Identifier {\n    identifier(): number;\n    identifier();\n    identifier() {}\n }");
        });

        it("should insert when a JSDoc exists", () => {
            doTest("class Identifier {\n    otherMethod(): string {}\n\n    /** Test */\n    identifier() {}\n }", 0, [{ returnType: "number" }],
                "class Identifier {\n    otherMethod(): string {}\n\n    identifier(): number;\n    /** Test */\n    identifier() {}\n }", 1);
        });

        it("should copy over the static, abstract, and scope keywords", () => {
            doTest("class Identifier {\n    protected abstract static async *identifier() {}\n }", 0, [{ isStatic: false }, {}],
                "class Identifier {\n    protected abstract identifier();\n    protected abstract static identifier();\n    protected abstract static async *identifier() {}\n }");
        });

        it("should be able to insert at start when another overload exists", () => {
            doTest("class Identifier {\n    identifier();\n    identifier() {}\n }", 0, [{ returnType: "string" }],
                "class Identifier {\n    identifier(): string;\n    identifier();\n    identifier() {}\n }");
        });

        it("should be able to insert at end when another overload exists", () => {
            doTest("class Identifier {\n    identifier();\n    identifier() {}\n }", 1, [{ returnType: "string" }],
                "class Identifier {\n    identifier();\n    identifier(): string;\n    identifier() {}\n }");
        });

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("class Identifier {\n    identifier();\n    identifier();\n    identifier() {}\n }", 1, [{ returnType: "string" }],
                "class Identifier {\n    identifier();\n    identifier(): string;\n    identifier();\n    identifier() {}\n }");
        });
    });

    describe(nameof<MethodDeclaration>(f => f.insertOverload), () => {
        function doTest(startCode: string, index: number, structure: OptionalKind<MethodDeclarationOverloadStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getMembers()[0] as MethodDeclaration;
            const result = methodDeclaration.insertOverload(index, structure);
            expect(result).to.be.instanceof(MethodDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("class Identifier {\n    identifier();\n    identifier();\n    identifier() {}\n }", 1, { returnType: "string" },
                "class Identifier {\n    identifier();\n    identifier(): string;\n    identifier();\n    identifier() {}\n }");
        });
    });

    describe(nameof<MethodDeclaration>(f => f.addOverloads), () => {
        function doTest(startCode: string, structures: OptionalKind<MethodDeclarationOverloadStructure>[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getMembers()[0] as MethodDeclaration;
            const result = methodDeclaration.addOverloads(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to add multiple", () => {
            doTest("class Identifier {\n    identifier();\n    identifier() {}\n}", [{ returnType: "string" }, { returnType: "number" }],
                "class Identifier {\n    identifier();\n    identifier(): string;\n    identifier(): number;\n    identifier() {}\n}");
        });
    });

    describe(nameof<MethodDeclaration>(f => f.addOverload), () => {
        function doTest(startCode: string, structure: OptionalKind<MethodDeclarationOverloadStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getMembers()[0] as MethodDeclaration;
            const result = methodDeclaration.addOverload(structure);
            expect(result).to.be.instanceof(MethodDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to add an overload", () => {
            doTest("class Identifier {\n    identifier();\n    identifier() {}\n }", { returnType: "string" },
                "class Identifier {\n    identifier();\n    identifier(): string;\n    identifier() {}\n }");
        });
    });

    describe(nameof<MethodDeclaration>(m => m.remove), () => {
        describe("no overload", () => {
            function doTest(code: string, nameToRemove: string, expectedCode: string) {
                const { sourceFile } = getInfoFromText<ClassDeclaration>(code);
                const method = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration).find(m => m.getName() === nameToRemove)!;
                method.remove();
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should remove when it's the only method", () => {
                doTest("class Identifier {\n    method() {}\n}", "method", "class Identifier {\n}");
            });

            it("should remove when it's the first method", () => {
                doTest("class Identifier {\n    method() {}\n\n    method2() {}\n}", "method", "class Identifier {\n    method2() {}\n}");
            });

            it("should remove when it's the middle method", () => {
                doTest("class Identifier {\n    method1(){}\n\n    method2(){}\n\n    method3() {}\n}", "method2",
                    "class Identifier {\n    method1(){}\n\n    method3() {}\n}");
            });

            it("should remove when the nodes all have js docs", () => {
                doTest("class Identifier {\n    /** Method1 */\n    method1(){}\n\n    /** Method2 */\n    method2(){}\n\n    /** Method3 */\n    method3() {}\n}",
                    "method2", "class Identifier {\n    /** Method1 */\n    method1(){}\n\n    /** Method3 */\n    method3() {}\n}");
            });

            it("should remove when it's the last method", () => {
                doTest("class Identifier {\n    method() {}\n\n    method2() {}\n}", "method2", "class Identifier {\n    method() {}\n}");
            });

            it("should remove when it's beside a property ", () => {
                doTest("class Identifier {\n    method(){}\n\n    prop: string;\n}", "method", "class Identifier {\n    prop: string;\n}");
            });

            it("should remove when it's in an ambient class", () => {
                doTest("declare class Identifier {\n    method(): void;\n\n    prop: string;\n\n    method2(): void;\n}", "method",
                    "declare class Identifier {\n    prop: string;\n\n    method2(): void;\n}");
            });

            it("should remove when it's in an class expression", () => {
                doTest("const myTest = class {\n    method1() {\n    }\n\n    method2() {\n    }\n\n    method3() {\n    }\n}", "method2",
                    "const myTest = class {\n    method1() {\n    }\n\n    method3() {\n    }\n}");
            });
        });

        describe("overloads", () => {
            function doTest(code: string, nameToRemove: string, index: number, expectedCode: string) {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
                const method = firstChild.getInstanceMethodOrThrow(nameToRemove);
                [...method.getOverloads(), method][index].remove();
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should remove when surrounded by other members", () => {
                doTest("class Identifier {\n    prop: string;\n\nmethod(str): void;\n    method(param) {}\n\nprop2: string;\n}", "method", 1,
                    "class Identifier {\n    prop: string;\nprop2: string;\n}");
            });

            it("should remove the method and all its overloads when calling on the body", () => {
                doTest("class Identifier {\n    method(str): void;\n    method(param) {}\n}", "method", 1, "class Identifier {\n}");
            });

            it("should remove only the specified overload", () => {
                doTest("class Identifier {\n    method(str): void;\n    method(param) {}\n}", "method", 0, "class Identifier {\n    method(param) {}\n}");
            });

            it("should remove when the first overload", () => {
                doTest("class Identifier {\n    method(first): void;\n    method(second): void;\n    method(param) {}\n}", "method", 0,
                    "class Identifier {\n    method(second): void;\n    method(param) {}\n}");
            });

            it("should remove when the middle overload", () => {
                doTest(
                    "class Identifier {\n    method(first): void;\n    method(second): void;\n    method(third): void;\n    method(param) {}\n}",
                    "method",
                    1,
                    "class Identifier {\n    method(first): void;\n    method(third): void;\n    method(param) {}\n}"
                );
            });

            it("should remove when the last overload", () => {
                doTest("class Identifier {\n    method(first): void;\n    method(last): void;\n    method(param) {}\n}", "method", 1,
                    "class Identifier {\n    method(first): void;\n    method(param) {}\n}");
            });

            it("should remove only the specified overload and its jsdoc", () => {
                doTest("class Identifier {\n    /** Test */\n    method(str): void;\n    method(param) {}\n}", "method", 0,
                    "class Identifier {\n    method(param) {}\n}");
            });

            it("should remove only the specified signature when it's in an ambient class", () => {
                doTest("declare class Identifier {\n    method(): void;\n    method(): void;\n}", "method", 1,
                    "declare class Identifier {\n    method(): void;\n}");
            });
        });
    });

    describe(nameof<MethodDeclaration>(m => m.set), () => {
        function doTest(startingCode: string, structure: OptionalKindAndTrivia<MethodDeclarationSpecificStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            const method = firstChild.getInstanceMethods()[0];
            method.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            const code = "class identifier {\n    method();\n    method() {}\n}";
            doTest(code, {}, code);
        });

        it("should replace existing overloads when changed", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<MethodDeclarationSpecificStructure>> = {
                overloads: [{ parameters: [{ name: "param" }] }]
            };
            doTest("class identifier {\n    method(): string;\n    method() {}\n}", structure, "class identifier {\n    method(param);\n    method() {}\n}");
        });

        it("should remove existing overloads when specifying an empty array", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<MethodDeclarationSpecificStructure>> = {
                overloads: []
            };
            doTest("class identifier {\n    method(): string;\n    method() {}\n}", structure, "class identifier {\n    method() {}\n}");
        });
    });

    describe(nameof<MethodDeclaration>(d => d.getStructure), () => {
        function doTest(code: string, expectedStructures: OptionalProperties<OptionalTrivia<MakeRequired<MethodDeclarationStructure>>, "overloads">[]) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
            const methods = firstChild.getMethods();

            expect(methods.length).to.equal(expectedStructures.length);

            for (let i = 0; i < expectedStructures.length; i++) {
                const expectedStructure = expectedStructures[i];
                const method = methods[i];
                const structure = method.getStructure() as MethodDeclarationStructure;
                expect(structure).to.deep.equal(fillStructures.method(expectedStructure));
            }
        }

        it("should get structure when abstract", () => {
            doTest("class Test { abstract method?(); }", [{
                kind: StructureKind.Method,
                statements: undefined,
                decorators: [],
                docs: [],
                isAbstract: true,
                isAsync: false,
                isGenerator: false,
                isStatic: false,
                hasQuestionToken: true,
                name: "method",
                parameters: [],
                returnType: undefined,
                scope: undefined,
                typeParameters: []
            }]);
        });

        it("should return method overloads as separate methods in an ambient context", () => {
            const structure: Omit<OptionalTrivia<MakeRequired<MethodDeclarationStructure>>, "overloads"> = {
                kind: StructureKind.Method,
                statements: undefined,
                decorators: [],
                docs: [],
                isAbstract: false,
                isAsync: false,
                isGenerator: false,
                isStatic: false,
                hasQuestionToken: false,
                name: "method",
                parameters: [],
                returnType: undefined,
                scope: undefined,
                typeParameters: []
            };

            doTest("declare class Test { method();\nmethod(); }", [structure, structure]);
        });

        it("should get structure when it has everything", () => {
            const code = `
class Test {
    /** overload */
    protected static async *method<T>(p): string;
    /** implementation */
    protected static async *method<T>(param): string {
    }
}
`;
            doTest(code, [{
                kind: StructureKind.Method,
                statements: [],
                decorators: [],
                docs: [{ description: "implementation" }],
                isAbstract: false,
                isAsync: true,
                isGenerator: true,
                isStatic: true,
                hasQuestionToken: false,
                name: "method",
                overloads: [{
                    kind: StructureKind.MethodOverload,
                    docs: [{ description: "overload" }],
                    isAsync: true,
                    isGenerator: true,
                    isStatic: true,
                    returnType: "string",
                    scope: Scope.Protected,
                    parameters: [{ name: "p" }],
                    typeParameters: [{ name: "T" }],
                    isAbstract: false,
                    hasQuestionToken: false
                }],
                parameters: [{ name: "param" }],
                returnType: "string",
                scope: Scope.Protected,
                typeParameters: [{ name: "T" }]
            }]);
        });
    });
});
