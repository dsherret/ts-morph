import { expect } from "chai";
import { ConstructSignatureDeclaration, InterfaceDeclaration } from "../../../../compiler";
import { ConstructSignatureDeclarationStructure, TypeParameterDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

describe(nameof(ConstructSignatureDeclaration), () => {
    function getFirstConstructSignatureWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstConstructSignature: opts.firstChild.getConstructSignatures()[0] };
    }

    describe(nameof<ConstructSignatureDeclaration>(n => n.set), () => {
        function doTest(code: string, structure: Partial<ConstructSignatureDeclarationStructure>, expectedCode: string) {
            const { firstConstructSignature, sourceFile } = getFirstConstructSignatureWithInfo(code);
            firstConstructSignature.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { new(): any; }", {}, "interface Identifier { new(): any; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { new(): any; }", { returnType: "string" }, "interface Identifier { new(): string; }");
        });

        it("should change when setting everything", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<ConstructSignatureDeclarationStructure>> = {
                docs: ["test"],
                parameters: [{ name: "param" }],
                returnType: "string",
                typeParameters: undefined
            };
            doTest(
                "interface Identifier {\n    new(): any;\n}",
                structure,
                "interface Identifier {\n    /** test */\n    new(param): string;\n}"
            );
        });
    });

    describe(nameof<ConstructSignatureDeclaration>(n => n.remove), () => {
        function doTest(code: string, indexToRemove: number, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<InterfaceDeclaration>(code);
            firstChild.getConstructSignatures()[indexToRemove].remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("interface Identifier {\n    new(): string;\n}", 0, "interface Identifier {\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("interface Identifier {\n    new(): string;\n    prop: string;\n    new(): string;\n}", 0,
                "interface Identifier {\n    prop: string;\n    new(): string;\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("interface Identifier {\n    new(): string;\n    new(): number;\n    new(): Date;\n}", 1,
                "interface Identifier {\n    new(): string;\n    new(): Date;\n}");
        });

        it("should remove when it's the last member", () => {
            doTest(
                "interface Identifier {\n    new(): string;\n    new(): number;\n}",
                1,
                "interface Identifier {\n    new(): string;\n}"
            );
        });

        it("should only remove the new signature specified", () => {
            doTest("interface Identifier {\n    new(): string;\n    new(param: number): string;\n    new(t: string): string;\n}", 1,
                "interface Identifier {\n    new(): string;\n    new(t: string): string;\n}");
        });
    });

    describe(nameof<ConstructSignatureDeclaration>(n => n.getStructure), () => {
        function doTest(code: string, expectedStructure: OptionalTrivia<MakeRequired<ConstructSignatureDeclarationStructure>>) {
            const { firstConstructSignature } = getFirstConstructSignatureWithInfo(code);
            const structure = firstConstructSignature.getStructure();
            expect(structure).to.deep.equal(fillStructures.constructSignature(expectedStructure));
        }

        it("should get when not has anything", () => {
            doTest("interface Identifier { new(); }", {
                kind: StructureKind.ConstructSignature,
                docs: [],
                parameters: [],
                returnType: undefined,
                typeParameters: []
            });
        });

        it("should get when has everything", () => {
            const code = `
interface Identifier {
    /** Test */
    new<T>(p): Test;
}`;
            doTest(code, {
                kind: StructureKind.ConstructSignature,
                docs: [{ description: "Test" }],
                parameters: [{ name: "p" }],
                returnType: "Test",
                typeParameters: [{ name: "T" }]
            });
        });
    });
});
