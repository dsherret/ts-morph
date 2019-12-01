import { expect } from "chai";
import { InterfaceDeclaration, PropertySignature } from "../../../../compiler";
import { PropertySignatureStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

describe(nameof(PropertySignature), () => {
    function getFirstPropertyWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstProperty: opts.firstChild.getProperties()[0] };
    }

    describe(nameof<PropertySignature>(n => n.set), () => {
        function doTest(code: string, structure: Partial<PropertySignatureStructure>, expectedCode: string) {
            const { firstProperty, sourceFile } = getFirstPropertyWithInfo(code);
            firstProperty.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { prop: string; }", {}, "interface Identifier { prop: string; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { prop: string; }", { type: "number" }, "interface Identifier { prop: number; }");
        });

        it("should change when setting everything", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<PropertySignatureStructure>> = {
                docs: ["test"],
                hasQuestionToken: true,
                name: "name",
                type: "number",
                initializer: "5",
                isReadonly: true
            };
            doTest(
                "interface Identifier {\n    prop: string;\n}",
                structure,
                "interface Identifier {\n    /** test */\n    readonly name?: number = 5;\n}"
            );
        });
    });

    describe(nameof<PropertySignature>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<InterfaceDeclaration>(code);
            firstChild.getProperty(nameToRemove)!.remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("interface Identifier {\n    member: string;\n}", "member", "interface Identifier {\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("interface Identifier {\n    member: string;\n    method(): string;\n    member2: string;\n}", "member",
                "interface Identifier {\n    method(): string;\n    member2: string;\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("interface Identifier {\n    member: string;\n    member2: string;\n    member3: string;\n}", "member2",
                "interface Identifier {\n    member: string;\n    member3: string;\n}");
        });

        it("should remove when it's the last member", () => {
            doTest(
                "interface Identifier {\n    member: string;\n    member2: string;\n}",
                "member2",
                "interface Identifier {\n    member: string;\n}"
            );
        });
    });

    describe(nameof<PropertySignature>(n => n.getStructure), () => {
        function doTest(code: string, expectedStructure: OptionalTrivia<MakeRequired<PropertySignatureStructure>>) {
            const { firstProperty } = getFirstPropertyWithInfo(code);
            const structure = firstProperty.getStructure();
            expect(structure).to.deep.equal(fillStructures.propertySignature(expectedStructure));
        }

        it("should get when not has anything", () => {
            doTest("interface Identifier { prop; }", {
                kind: StructureKind.PropertySignature,
                docs: [],
                hasQuestionToken: false,
                initializer: undefined,
                isReadonly: false,
                name: "prop",
                type: undefined
            });
        });

        it("should get when has everything", () => {
            const code = `
interface Identifier {
    /** Test */
    readonly prop?: number = 5;
}`;
            doTest(code, {
                kind: StructureKind.PropertySignature,
                docs: [{ description: "Test" }],
                hasQuestionToken: true,
                initializer: "5",
                isReadonly: true,
                name: "prop",
                type: "number"
            });
        });
    });
});
