import { expect } from "chai";
import { TypeAliasDeclaration } from "../../../compiler";
import { TypeAliasDeclarationStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(TypeAliasDeclaration), () => {
    describe(nameof<TypeAliasDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<TypeAliasDeclarationStructure>, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<TypeAliasDeclaration>(code);
            firstChild.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the when nothing is set", () => {
            doTest("type Identifier = string;", {}, "type Identifier = string;");
        });

        it("should change the property when setting", () => {
            doTest("type Identifier = string;", { type: "number" }, "type Identifier = number;");
        });

        it("should change the property when setting as a writer function", () => {
            doTest("type Identifier = string;", { type: writer => writer.write("number") }, "type Identifier = number;");
        });
    });

    describe(nameof<TypeAliasDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getTypeAliases()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the type alias declaration", () => {
            doTest("type I = 1;\ntype J = 2;\ntype K = 3;", 1, "type I = 1;\ntype K = 3;");
        });
    });

    describe(nameof<TypeAliasDeclaration>(n => n.getStructure), () => {
        function doTest(startingCode: string, expectedStructure: MakeRequired<TypeAliasDeclarationStructure>) {
            const { firstChild } = getInfoFromText<TypeAliasDeclaration>(startingCode);
            const structure = firstChild.getStructure();
            structure.typeParameters = structure.typeParameters!.map(p => ({ name: p.name }));
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get when has nothing", () => {
            doTest("type Identifier = string;", {
                docs: [],
                hasDeclareKeyword: false,
                isDefaultExport: false,
                isExported: false,
                name: "Identifier",
                type: "string",
                typeParameters: []
            });
        });

        it("should get when has everything", () => {
            const code = `
/** Test */
export declare type Identifier<T> = string;
`;
            doTest(code, {
                docs: [{ description: "Test" }],
                hasDeclareKeyword: true,
                isDefaultExport: false,
                isExported: true,
                name: "Identifier",
                type: "string",
                typeParameters: [{ name: "T" }]
            });
        });
    });
});
