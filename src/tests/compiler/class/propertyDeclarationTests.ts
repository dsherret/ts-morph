import {expect} from "chai";
import {PropertyDeclaration, ClassDeclaration} from "./../../../compiler";
import {PropertyDeclarationStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(PropertyDeclaration), () => {
    function getFirstPropertyWithInfo(code: string) {
        const opts = getInfoFromText<ClassDeclaration>(code);
        return { ...opts, firstProperty: opts.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<PropertyDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<PropertyDeclarationStructure>, expectedCode: string) {
            const {firstProperty, sourceFile} = getFirstPropertyWithInfo(code);
            firstProperty.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the property when nothing is set", () => {
            doTest("class Identifier { prop: string; }", {}, "class Identifier { prop: string; }");
        });

        it("should change the property when setting", () => {
            doTest("class Identifier { prop: string; }", { type: "number" }, "class Identifier { prop: number; }");
        });
    });
});
