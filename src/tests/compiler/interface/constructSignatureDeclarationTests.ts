import {expect} from "chai";
import {ConstructSignatureDeclaration, InterfaceDeclaration} from "./../../../compiler";
import {ConstructSignatureDeclarationStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ConstructSignatureDeclaration), () => {
    function getFirstConstructSignatureWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstConstructSignature: opts.firstChild.getConstructSignatures()[0] };
    }

    describe(nameof<ConstructSignatureDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<ConstructSignatureDeclarationStructure>, expectedCode: string) {
            const {firstConstructSignature, sourceFile} = getFirstConstructSignatureWithInfo(code);
            firstConstructSignature.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { new(): any; }", {}, "interface Identifier { new(): any; }");
        });

        it("should change when setting", () => {
            doTest("interface Identifier { new(): any; }", { returnType: "string" }, "interface Identifier { new(): string; }");
        });
    });
});
