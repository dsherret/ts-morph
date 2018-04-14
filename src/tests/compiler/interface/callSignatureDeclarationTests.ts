import { expect } from "chai";
import { CallSignatureDeclaration, InterfaceDeclaration } from "../../../compiler";
import { CallSignatureDeclarationStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(CallSignatureDeclaration), () => {
    function getFirstCallSignatureWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstCallSignature: opts.firstChild.getCallSignatures()[0] };
    }

    describe(nameof<CallSignatureDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<CallSignatureDeclarationStructure>, expectedCode: string) {
            const {firstCallSignature, sourceFile} = getFirstCallSignatureWithInfo(code);
            firstCallSignature.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { (): any; }", {}, "interface Identifier { (): any; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { (): any; }", { returnType: "string", typeParameters: [{ name: "T" }] }, "interface Identifier { <T>(): string; }");
        });
    });

    describe(nameof<CallSignatureDeclaration>(n => n.remove), () => {
        function doTest(code: string, indexToRemove: number, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(code);
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
