import { expect } from "chai";
import { ClassDeclaration, ConstructorDeclaration, Scope } from "../../../../compiler";
import { ConstructorDeclarationOverloadStructure, ConstructorDeclarationStructure, ConstructorDeclarationSpecificStructure,
    TypeParameterDeclarationStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ConstructorDeclaration), () => {
    describe(nameof<ConstructorDeclaration>(f => f.insertOverloads), () => {
        function doTest(startCode: string, index: number, structures: ConstructorDeclarationOverloadStructure[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getConstructors()[0];
            const result = methodDeclaration.insertOverloads(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when no other overloads exist", () => {
            doTest("class Identifier {\n    constructor() {}\n }", 0, [{ parameters: [{ name: "param" }] }, {}],
                "class Identifier {\n    constructor(param);\n    constructor();\n    constructor() {}\n }");
        });

        it("should copy over the scope keyword", () => {
            doTest("class Identifier {\n    protected constructor(p) {}\n }", 0, [{ parameters: [{ name: "param" }] }, {}],
                "class Identifier {\n    protected constructor(param);\n    protected constructor();\n    protected constructor(p) {}\n }");
        });

        it("should be able to insert at start when another overload exists", () => {
            doTest("class Identifier {\n    constructor();\n    constructor() {}\n }", 0, [{ parameters: [{ name: "param" }] }],
                "class Identifier {\n    constructor(param);\n    constructor();\n    constructor() {}\n }");
        });

        it("should be able to insert at end when another overload exists", () => {
            doTest("class Identifier {\n    constructor();\n    constructor() {}\n }", 1, [{ parameters: [{ name: "param" }] }],
                "class Identifier {\n    constructor();\n    constructor(param);\n    constructor() {}\n }");
        });

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("class Identifier {\n    constructor();\n    constructor();\n    constructor() {}\n }", 1, [{ parameters: [{ name: "param" }] }],
                "class Identifier {\n    constructor();\n    constructor(param);\n    constructor();\n    constructor() {}\n }");
        });
    });

    describe(nameof<ConstructorDeclaration>(f => f.insertOverload), () => {
        function doTest(startCode: string, index: number, structure: ConstructorDeclarationOverloadStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getMembers()[0] as ConstructorDeclaration;
            const result = methodDeclaration.insertOverload(index, structure);
            expect(result).to.be.instanceof(ConstructorDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("class Identifier {\n    constructor();\n    constructor();\n    constructor() {}\n }", 1, { parameters: [{ name: "param" }] },
                "class Identifier {\n    constructor();\n    constructor(param);\n    constructor();\n    constructor() {}\n }");
        });
    });

    describe(nameof<ConstructorDeclaration>(f => f.addOverloads), () => {
        function doTest(startCode: string, structures: ConstructorDeclarationOverloadStructure[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getMembers()[0] as ConstructorDeclaration;
            const result = methodDeclaration.addOverloads(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to add multiple", () => {
            doTest("class Identifier {\n    constructor();\n    constructor() {}\n }", [{ parameters: [{ name: "param" }] }, { parameters: [{ name: "param2" }] }],
                "class Identifier {\n    constructor();\n    constructor(param);\n    constructor(param2);\n    constructor() {}\n }");
        });
    });

    describe(nameof<ConstructorDeclaration>(f => f.addOverload), () => {
        function doTest(startCode: string, structure: ConstructorDeclarationOverloadStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getMembers()[0] as ConstructorDeclaration;
            const result = methodDeclaration.addOverload(structure);
            expect(result).to.be.instanceof(ConstructorDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to add an overload", () => {
            doTest("class Identifier {\n    constructor();\n    constructor() {}\n }", { parameters: [{ name: "param" }] },
                "class Identifier {\n    constructor();\n    constructor(param);\n    constructor() {}\n }");
        });
    });

    describe(nameof<ConstructorDeclaration>(d => d.remove), () => {
        function doTest(startCode: string, expectedCode: string) {
            const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(startCode);
            firstChild.getConstructors()[0].remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when only member", () => {
            doTest("class MyClass {\n    constructor() {\n    }\n}",
                "class MyClass {\n}");
        });

        it("should remove when between other members", () => {
            doTest("class MyClass {\n    prop: string;\n\n    constructor() {\n    }\n\n    m() {\n    }\n}",
                "class MyClass {\n    prop: string;\n\n    m() {\n    }\n}");
        });

        it("should remove when at start", () => {
            doTest("class MyClass {\n    constructor() {\n    }\n\n    prop: string;\n}",
                "class MyClass {\n    prop: string;\n}");
        });

        it("should remove when at end", () => {
            doTest("class MyClass {\n    prop: string;\n\n    constructor() {\n    }\n}",
                "class MyClass {\n    prop: string;\n}");
        });

        it("should remove when there are overloads", () => {
            doTest("class MyClass {\n    constructor();constructor() {\n    }\n}",
                "class MyClass {\n}");
        });

        it("should only remove the overload when calling remove on the overload", () => {
            const startCode = "class MyClass {\n    constructor();\n    constructor() {\n    }\n}";
            const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(startCode);
            firstChild.getConstructors()[0].getOverloads()[0].remove();
            expect(sourceFile.getFullText()).to.equal("class MyClass {\n    constructor() {\n    }\n}");
        });
    });

    describe(nameof<ConstructorDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: ConstructorDeclarationSpecificStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            const ctor = firstChild.getConstructors()[0];
            ctor.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            const code = "class identifier {\n    constructor();\n    constructor() {}\n}";
            doTest(code, {}, code);
        });

        it("should replace existing overloads when changed", () => {
            const structure: MakeRequired<ConstructorDeclarationSpecificStructure> = {
                overloads: [{ parameters: [{ name: "param" }] }]
            };
            doTest("class identifier {\n    constructor(): string;\n    constructor() {}\n}", structure,
                "class identifier {\n    constructor(param);\n    constructor() {}\n}");
        });

        it("should remove existing overloads when specifying an empty array", () => {
            const structure: MakeRequired<ConstructorDeclarationSpecificStructure> = {
                overloads: []
            };
            doTest("class identifier {\n    constructor(): string;\n    constructor() {}\n}", structure,
                "class identifier {\n    constructor() {}\n}");
        });
    });

    describe(nameof<ConstructorDeclaration>(n => n.getStructure), () => {
        type PropertyNamesToExclude = "classes" | "functions" | "enums" | "interfaces" | "namespaces" | "typeAliases";
        function doTest(code: string, expectedStructure: Omit<MakeRequired<ConstructorDeclarationStructure>, PropertyNamesToExclude>) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(code);
            const structure = firstChild.getConstructors()[0].getStructure();
            structure.parameters = structure.parameters!.map(p => ({ name: p.name }));
            structure.typeParameters = structure.typeParameters!.map(p => ({ name: (p as TypeParameterDeclarationStructure).name }));

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get structure when empty", () => {
            doTest("class T { constructor() {} }", {
                bodyText: "",
                docs: [],
                overloads: [],
                parameters: [],
                returnType: undefined,
                scope: undefined,
                typeParameters: []
            });
        });

        it("should get structure when has everything", () => {
            const code = `
class T {
    /** overload */
    public constructor<T>();
    /** implementation */
    public constructor<T>(p) {
        test;
    }
}
`;
            doTest(code, {
                bodyText: "test;",
                docs: [{ description: "implementation" }],
                overloads: [{
                    scope: Scope.Public,
                    docs: [{ description: "overload" }],
                    parameters: [],
                    returnType: undefined,
                    typeParameters: [{
                        name: "T", constraint: undefined, default: undefined
                    }]
                }],
                parameters: [{ name: "p" }],
                returnType: undefined,
                scope: Scope.Public,
                typeParameters: [{ name: "T" }]
            });
        });
    });
});
