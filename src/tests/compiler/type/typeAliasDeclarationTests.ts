import {expect} from "chai";
import {TypeAliasDeclaration} from "./../../../compiler";
import {TypeAliasDeclarationStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypeAliasDeclaration), () => {
    describe(nameof<TypeAliasDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<TypeAliasDeclarationStructure>, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<TypeAliasDeclaration>(code);
            firstChild.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the when nothing is set", () => {
            doTest("type Identifier = string;", {}, "type Identifier = string;");
        });

        it("should change the property when setting", () => {
            doTest("type Identifier = string;", { type: "number" }, "type Identifier = number;");
        });
    });
});
