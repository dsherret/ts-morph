import { expect } from "chai";
import { CallSignatureDeclaration, FunctionDeclaration, TypeAliasDeclaration, TypeParameterDeclaration, TypeParameteredNode } from "../../../compiler";
import { TypeParameterDeclarationStructure, TypeParameteredNodeStructure } from "../../../structures";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../testHelpers";

describe(nameof(TypeParameteredNode), () => {
    describe(nameof<TypeParameteredNode>(d => d.getTypeParameter), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function func<T, U>(){}");

        it("should get the type parameter by name", () => {
            expect(firstChild.getTypeParameter("T")!.getName()).to.equal("T");
        });

        it("should get the type parameter by function", () => {
            expect(firstChild.getTypeParameter(p => p.getName() === "U")).to.equal(firstChild.getTypeParameters()[1]);
        });

        it("should return undefined when it doesn't exist", () => {
            expect(firstChild.getTypeParameter("typeParam")).to.be.undefined;
        });
    });

    describe(nameof<TypeParameteredNode>(d => d.getTypeParameterOrThrow), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function func<T, U>(){}");

        it("should get the type parameter by name", () => {
            expect(firstChild.getTypeParameterOrThrow("T").getName()).to.equal("T");
        });

        it("should get the type parameter by function", () => {
            expect(firstChild.getTypeParameterOrThrow(p => p.getName() === "U")).to.equal(firstChild.getTypeParameters()[1]);
        });

        it("should throw when it doesn't exist", () => {
            expect(() => firstChild.getTypeParameterOrThrow("typeParam")).to.throw();
        });
    });

    describe(nameof<TypeParameteredNode>(n => n.getTypeParameters), () => {
        const {sourceFile} = getInfoFromText("function noTypeParamsFunc() {}\n function typeParamsFunc<T, U>() {}");
        const noTypeParamsFunc = sourceFile.getFunctions()[0];
        const typeParamsFunc = sourceFile.getFunctions()[1];

        describe("having no type parameters", () => {
            it("should return an empty array", () => {
                expect(noTypeParamsFunc.getTypeParameters().length).to.equal(0);
            });
        });

        describe("having type parameters", () => {
            it("should get the correct number of type parameters", () => {
                expect(typeParamsFunc.getTypeParameters().length).to.equal(2);
            });

            it("should have the right instance of", () => {
                expect(typeParamsFunc.getTypeParameters()[0]).to.be.instanceOf(TypeParameterDeclaration);
            });
        });
    });

    describe(nameof<TypeParameteredNode>(n => n.addTypeParameter), () => {
        function doTest(startCode: string, structure: TypeParameterDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addTypeParameter(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceof(TypeParameterDeclaration);
        }

        it("should add when none exists", () => {
            doTest("function identifier() {}", { name: "T" }, "function identifier<T>() {}");
        });

        it("should add when one exists", () => {
            doTest("function identifier<T>() {}", { name: "U" }, "function identifier<T, U>() {}");
        });
    });

    describe(nameof<TypeParameteredNode>(n => n.addTypeParameters), () => {
        function doTest(startCode: string, structures: TypeParameterDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addTypeParameters(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("function identifier<T>() {}", [{ name: "U" }, { name: "V" }], "function identifier<T, U, V>() {}");
        });
    });

    describe(nameof<TypeParameteredNode>(n => n.insertTypeParameter), () => {
        it("should insert when none exists for a call signature declaration", () => {
            const startCode = "interface Identifier {\n    (): void;\n}\n";
            const {descendant, sourceFile} = getInfoFromTextWithDescendant<CallSignatureDeclaration>(startCode, SyntaxKind.CallSignature);
            descendant.insertTypeParameter(0, { name: "T" });
            expect(sourceFile.getFullText()).to.equal("interface Identifier {\n    <T>(): void;\n}\n");
        });

        function doTest(startCode: string, insertIndex: number, structure: TypeParameterDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertTypeParameter(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceof(TypeParameterDeclaration);
        }

        it("should insert when none exists", () => {
            doTest("function identifier() {}", 0, { name: "T" }, "function identifier<T>() {}");
        });

        it("should insert at the start", () => {
            doTest("function identifier<T>() {}", 0, { name: "U" }, "function identifier<U, T>() {}");
        });

        it("should insert at the end", () => {
            doTest("function identifier<T>() {}", 1, { name: "U" }, "function identifier<T, U>() {}");
        });

        it("should insert in the middle", () => {
            doTest("function identifier<T, U>() {}", 1, { name: "V" }, "function identifier<T, V, U>() {}");
        });

        it("should insert with constraint", () => {
            doTest("function identifier<T, U>() {}", 1, { name: "V", constraint: "string" }, "function identifier<T, V extends string, U>() {}");
        });

        it("should insert with default", () => {
            doTest("function identifier<T, U>() {}", 1, { name: "V", default: "string" }, "function identifier<T, V = string, U>() {}");
        });

        it("should insert all the properties of the structure", () => {
            const structure: MakeRequired<TypeParameterDeclarationStructure> = {
                name: "V",
                constraint: "string",
                default: "number"
            };
            doTest("function identifier() {}", 0, structure, "function identifier<V extends string = number>() {}");
        });
    });

    describe(nameof<TypeParameteredNode>(n => n.insertTypeParameters), () => {
        function doTest(startCode: string, insertIndex: number, structures: TypeParameterDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertTypeParameters(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert multiple", () => {
            doTest("function identifier<V>() {}", 0, [{ name: "T" }, { name: "U" }], "function identifier<T, U, V>() {}");
        });

        it("should do nothing if empty array", () => {
            doTest("function identifier() {}", 0, [], "function identifier() {}");
        });
    });

    describe(nameof<TypeAliasDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: TypeParameteredNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<TypeAliasDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("type myAlias = string;", { typeParameters: [{ name: "T" }] }, "type myAlias<T> = string;");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("type myAlias = string;", {}, "type myAlias = string;");
        });
    });
});
