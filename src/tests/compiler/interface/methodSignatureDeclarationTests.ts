import { expect } from "chai";
import { InterfaceDeclaration, MethodSignature } from "../../../compiler";
import { MethodSignatureStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(MethodSignature), () => {
    function getFirstMethodWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstMethod: opts.firstChild.getMethods()[0] };
    }

    describe(nameof<MethodSignature>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<MethodSignatureStructure>, expectedCode: string) {
            const {firstMethod, sourceFile} = getFirstMethodWithInfo(code);
            firstMethod.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { method(): string; }", {}, "interface Identifier { method(): string; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { method(): string; }", { returnType: "number" }, "interface Identifier { method(): number; }");
        });
    });

    describe(nameof<MethodSignature>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, indexToRemove: number, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(code);
            firstChild.getMethods().filter(m => m.getName() === nameToRemove)[indexToRemove].remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("interface Identifier {\n    member(): string;\n}", "member", 0, "interface Identifier {\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("interface Identifier {\n    member(): string;\n    prop: string;\n    member2(): string;\n}", "member", 0,
                "interface Identifier {\n    prop: string;\n    member2(): string;\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("interface Identifier {\n    member(): string;\n    member2(): string;\n    member3(): string;\n}", "member2", 0,
                "interface Identifier {\n    member(): string;\n    member3(): string;\n}");
        });

        it("should remove when it's the last member", () => {
            doTest("interface Identifier {\n    member(): string;\n    member2(): string;\n}", "member2", 0,
                "interface Identifier {\n    member(): string;\n}");
        });

        it("should only remove the member signature specified", () => {
            doTest("interface Identifier {\n    member(): string;\n    member(param: number): string;\n    member(t: string): string;\n}", "member", 1,
                "interface Identifier {\n    member(): string;\n    member(t: string): string;\n}");
        });
    });
});
