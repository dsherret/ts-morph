import { expect } from "chai";
import { NamedImports } from "../../../../compiler";
import { TypeGuards } from "../../../../utils";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(NamedImports), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return {
            descendant: info.sourceFile.getFirstDescendantOrThrow(TypeGuards.isNamedImports),
            ...info
        };
    }

    describe(nameof<NamedImports>(n => n.getElements), () => {
        function doTest(text: string, elements: string[]) {
            const { descendant } = getInfo(text);
            expect(descendant.getElements().map(e => e.getText())).to.deep.equal(elements);
        }

        it("should get", () => {
            doTest("import { Test, Test2 } from 'test'", ["Test", "Test2"]);
        });
    });
});
