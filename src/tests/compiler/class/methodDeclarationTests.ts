import {expect} from "chai";
import {MethodDeclaration, ClassDeclaration} from "./../../../compiler";
import {MethodDeclarationOverloadStructure, MethodDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(MethodDeclaration), () => {
    describe(nameof<MethodDeclaration>(f => f.insertOverloads), () => {
        function doTest(startCode: string, index: number, structures: MethodDeclarationOverloadStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getAllMembers()[0] as MethodDeclaration;
            const result = methodDeclaration.insertOverloads(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when no other overloads exist", () => {
            doTest("class Identifier {\n    identifier() {}\n }", 0, [{ returnType: "number" }, {}],
                "class Identifier {\n    identifier(): number;\n    identifier();\n    identifier() {}\n }");
        });

        it("should copy over the static, abstract, and scope keywords", () => {
            doTest("class Identifier {\n    protected abstract static async *identifier() {}\n }", 0, [{ isStatic: false }, {}],
                "class Identifier {\n    protected abstract identifier();\n    protected abstract static identifier();\n    protected abstract static async *identifier() {}\n }");
        });

        it("should be able to insert at start when another overload exists", () => {
            doTest("class Identifier {\n  identifier();\n  identifier() {}\n }", 0, [{ returnType: "string" }],
                "class Identifier {\n  identifier(): string;\n  identifier();\n  identifier() {}\n }");
        });

        it("should be able to insert at end when another overload exists", () => {
            doTest("class Identifier {\n  identifier();\n  identifier() {}\n }", 1, [{ returnType: "string" }],
                "class Identifier {\n  identifier();\n  identifier(): string;\n  identifier() {}\n }");
        });

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("class Identifier {\n  identifier();\n  identifier();\n  identifier() {}\n }", 1, [{ returnType: "string" }],
                "class Identifier {\n  identifier();\n  identifier(): string;\n  identifier();\n  identifier() {}\n }");
        });
    });

    describe(nameof<MethodDeclaration>(f => f.insertOverload), () => {
        function doTest(startCode: string, index: number, structure: MethodDeclarationOverloadStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getAllMembers()[0] as MethodDeclaration;
            const result = methodDeclaration.insertOverload(index, structure);
            expect(result).to.be.instanceof(MethodDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to insert in the middle when other overloads exists", () => {
            doTest("class Identifier {\n  identifier();\n  identifier();\n  identifier() {}\n }", 1, { returnType: "string" },
                "class Identifier {\n  identifier();\n  identifier(): string;\n  identifier();\n  identifier() {}\n }");
        });
    });

    describe(nameof<MethodDeclaration>(f => f.addOverloads), () => {
        function doTest(startCode: string, structures: MethodDeclarationOverloadStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getAllMembers()[0] as MethodDeclaration;
            const result = methodDeclaration.addOverloads(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to add multiple", () => {
            doTest("class Identifier {\n  identifier();\n  identifier() {}\n }", [{ returnType: "string" }, { returnType: "number" }],
                "class Identifier {\n  identifier();\n  identifier(): string;\n  identifier(): number;\n  identifier() {}\n }");
        });
    });

    describe(nameof<MethodDeclaration>(f => f.addOverload), () => {
        function doTest(startCode: string, structure: MethodDeclarationOverloadStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
            const methodDeclaration = firstChild.getAllMembers()[0] as MethodDeclaration;
            const result = methodDeclaration.addOverload(structure);
            expect(result).to.be.instanceof(MethodDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should be able to add an overload", () => {
            doTest("class Identifier {\n  identifier();\n  identifier() {}\n }", { returnType: "string" },
                "class Identifier {\n  identifier();\n  identifier(): string;\n  identifier() {}\n }");
        });
    });

    describe(nameof<MethodDeclaration>(m => m.fill), () => {
        function doTest(startingCode: string, structure: MethodDeclarationSpecificStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
            const method = firstChild.getInstanceMethods()[0];
            method.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class identifier {\n  method() {}\n}", {}, "class identifier {\n  method() {}\n}");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<MethodDeclarationSpecificStructure> = {
                overloads: [{ parameters: [{ name: "param" }] }]
            };
            doTest("class identifier {\n  method() {}\n}", structure, "class identifier {\n  method(param);\n  method() {}\n}");
        });
    });
});
