import {expect} from "chai";
import {PropertyDeclaration, InterfaceDeclaration} from "./../../../compiler";
import {PropertyDeclarationStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(PropertyDeclaration), () => {
    function getFirstPropertyWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstProperty: opts.firstChild.getProperties()[0] };
    }

    describe(nameof<PropertyDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<PropertyDeclarationStructure>, expectedCode: string) {
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
});
