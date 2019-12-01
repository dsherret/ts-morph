import { expect } from "chai";
import { InterfaceDeclaration, MethodSignature } from "../../../../compiler";
import { MethodSignatureStructure, TypeParameterDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

describe(nameof(MethodSignature), () => {
    function getFirstMethodWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstMethod: opts.firstChild.getMethods()[0] };
    }

    describe(nameof<MethodSignature>(n => n.set), () => {
        function doTest(code: string, structure: Partial<MethodSignatureStructure>, expectedCode: string) {
            const { firstMethod, sourceFile } = getFirstMethodWithInfo(code);
            firstMethod.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { method(): string; }", {}, "interface Identifier { method(): string; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { method(): string; }", { returnType: "number" }, "interface Identifier { method(): number; }");
        });

        it("should change when setting everything", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<MethodSignatureStructure>> = {
                docs: ["test"],
                hasQuestionToken: true,
                name: "name",
                parameters: [{ name: "param" }],
                typeParameters: ["T"],
                returnType: "number"
            };
            doTest(
                "interface Identifier {\n    method(): string;\n}",
                structure,
                "interface Identifier {\n    /** test */\n    name?<T>(param): number;\n}"
            );
        });
    });

    describe(nameof<MethodSignature>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, indexToRemove: number, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<InterfaceDeclaration>(code);
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

    describe(nameof<MethodSignature>(n => n.getStructure), () => {
        function doTest(code: string, expectedStructure: OptionalTrivia<MakeRequired<MethodSignatureStructure>>) {
            const { firstMethod } = getFirstMethodWithInfo(code);
            const structure = firstMethod.getStructure();
            expect(structure).to.deep.equal(fillStructures.methodSignature(expectedStructure));
        }

        it("should get when not has anything", () => {
            doTest("interface Identifier { method(); }", {
                kind: StructureKind.MethodSignature,
                docs: [],
                hasQuestionToken: false,
                name: "method",
                parameters: [],
                returnType: undefined,
                typeParameters: []
            });
        });

        it("should get when has everything", () => {
            const code = `
interface Identifier {
    /** Test */
    method?<T>(p): string;
}`;
            doTest(code, {
                kind: StructureKind.MethodSignature,
                docs: [{ description: "Test" }],
                hasQuestionToken: true,
                name: "method",
                parameters: [{ name: "p" }],
                returnType: "string",
                typeParameters: [{ name: "T" }]
            });
        });
    });
});
