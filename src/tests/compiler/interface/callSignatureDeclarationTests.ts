import { expect } from "chai";
import { CallSignatureDeclaration, InterfaceDeclaration } from "../../../compiler";
import { CallSignatureDeclarationStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

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
    });

    describe(nameof<CallSignatureDeclaration>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: MakeRequired<CallSignatureDeclarationStructure>) {
            const { firstCallSignature } = getFirstCallSignatureWithInfo(text);
            const structure = firstCallSignature.getStructure();
            structure.typeParameters = structure.typeParameters!.map(p => ({ name: p.name }));
            structure.parameters = structure.parameters!.map(p => ({ name: p.name }));
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get when has nothing", () => {
            doTest("interface Identifier { (); }", {
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
            doTest("interface Identifier {\n    (): string;\n    (): number;\n}", 1,
                "interface Identifier {\n    (): string;\n}");
        });

        it("should only remove the new signature specified", () => {
            doTest("interface Identifier {\n    (): string;\n    (param: number): string;\n    (t: string): string;\n}", 1,
                "interface Identifier {\n    (): string;\n    (t: string): string;\n}");
        });
    });
});
