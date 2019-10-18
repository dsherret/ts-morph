import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayBindingPattern } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithBindingPattern(text: string) {
    const info = getInfoFromTextWithDescendant<ArrayBindingPattern>(text, SyntaxKind.ArrayBindingPattern);
    return { ...info, bindingPattern: info.descendant };
}

describe(nameof(ArrayBindingPattern), () => {
    describe(nameof<ArrayBindingPattern>(n => n.getElements), () => {
        function doTest(text: string, expectedTexts: string[]) {
            const { bindingPattern } = getInfoFromTextWithBindingPattern(text);
            expect(bindingPattern.getElements().map(e => e.getText())).to.deep.equal(expectedTexts);
        }

        it("should get the elements", () => {
            doTest("const [t, u, ...v] = [1, 2, 3];", ["t", "u", "...v"]);
        });
    });
});
