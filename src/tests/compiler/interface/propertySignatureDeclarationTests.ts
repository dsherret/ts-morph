import { expect } from "chai";
import { InterfaceDeclaration, PropertySignature } from "../../../compiler";
import { PropertySignatureStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(PropertySignature), () => {
    function getFirstPropertyWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstProperty: opts.firstChild.getProperties()[0] };
    }

    describe(nameof<PropertySignature>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<PropertySignatureStructure>, expectedCode: string) {
            const {firstProperty, sourceFile} = getFirstPropertyWithInfo(code);
            firstProperty.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { prop: string; }", {}, "interface Identifier { prop: string; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { prop: string; }", { type: "number" }, "interface Identifier { prop: number; }");
        });
    });

    describe(nameof<PropertySignature>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(code);
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
            doTest("interface Identifier {\n    member: string;\n    member2: string;\n}", "member2",
                "interface Identifier {\n    member: string;\n}");
        });
    });
});
