import { expect } from "chai";
import { CallSignatureDeclaration, InterfaceDeclaration } from "../../../../compiler";
import { CallSignatureDeclarationStructure, TypeParameterDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

describe(nameof(CallSignatureDeclaration), () => {
    function getFirstCallSignatureWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstCallSignature: opts.firstChild.getCallSignatures()[0] };
    }

    describe(nameof<CallSignatureDeclaration>(n => n.set), () => {
        function doTest(code: string, structure: Partial<CallSignatureDeclarationStructure>, expectedCode: string) {
            const { firstCallSignature, sourceFile } = getFirstCallSignatureWithInfo(code);
            firstCallSignature.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { (): any; }", {}, "interface Identifier { (): any; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { (): any; }", { returnType: "string", typeParameters: [{ name: "T" }] }, "interface Identifier { <T>(): string; }");
        });

        it("should change when setting everything", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<CallSignatureDeclarationStructure>> = {
                docs: ["test"],
                parameters: [{ name: "param" }],
                typeParameters: ["T"],
                returnType: "string"
            };
            doTest("interface Identifier {\n    (): any;\n}", structure, "interface Identifier {\n    /** test */\n    <T>(param): string;\n}");
        });
    });

    describe(nameof<CallSignatureDeclaration>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<CallSignatureDeclarationStructure>>) {
            const { firstCallSignature } = getFirstCallSignatureWithInfo(text);
            const structure = firstCallSignature.getStructure();
            expect(structure).to.deep.equal(fillStructures.callSignature(expectedStructure));
        }

        it("should get when has nothing", () => {
            doTest("interface Identifier { (); }", {
                kind: StructureKind.CallSignature,
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
    <T>(p): string;
}
`;
            doTest(code, {
                kind: StructureKind.CallSignature,
                docs: [{ description: "Test" }],
                parameters: [{ name: "p" }],
                returnType: "string",
                typeParameters: [{ name: "T" }]
            });
        });
    });

    describe(nameof<CallSignatureDeclaration>(n => n.remove), () => {
        function doTest(code: string, indexToRemove: number, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<InterfaceDeclaration>(code);
            firstChild.getCallSignatures()[indexToRemove].remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("interface Identifier {\n    (): string;\n}", 0, "interface Identifier {\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("interface Identifier {\n    (): string;\n    prop: string;\n    (): string;\n}", 0,
                "interface Identifier {\n    prop: string;\n    (): string;\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("interface Identifier {\n    (): string;\n    (): number;\n    (): Date;\n}", 1,
                "interface Identifier {\n    (): string;\n    (): Date;\n}");
        });

        it("should remove when it's the last member", () => {
            doTest("interface Identifier {\n    (): string;\n    (): number;\n}", 1, "interface Identifier {\n    (): string;\n}");
        });

        it("should only remove the new signature specified", () => {
            doTest("interface Identifier {\n    (): string;\n    (param: number): string;\n    (t: string): string;\n}", 1,
                "interface Identifier {\n    (): string;\n    (t: string): string;\n}");
        });
    });
});
