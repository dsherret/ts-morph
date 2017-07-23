import {expect} from "chai";
import {MethodDeclaration, InterfaceDeclaration} from "./../../../compiler";
import {MethodDeclarationStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(MethodDeclaration), () => {
    function getFirstMethodWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstMethod: opts.firstChild.getMethods()[0] };
    }

    describe(nameof<MethodDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<MethodDeclarationStructure>, expectedCode: string) {
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
});
