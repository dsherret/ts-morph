import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ObjectBindingPattern } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithBindingPattern(text: string) {
    const info = getInfoFromTextWithDescendant<ObjectBindingPattern>(text, SyntaxKind.ObjectBindingPattern);
    return { ...info, bindingPattern: info.descendant };
}

describe(nameof(ObjectBindingPattern), () => {
    describe(nameof<ObjectBindingPattern>(n => n.getElements), () => {
        function doTest(text: string, expectedTexts: string[]) {
            const { bindingPattern } = getInfoFromTextWithBindingPattern(text);
            expect(bindingPattern.getElements().map(e => e.getText())).to.deep.equal(expectedTexts);
        }

        it("should get the elements", () => {
            doTest("const { t, u, ...v } = { t: 1, u: 2 };", ["t", "u", "...v"]);
        });
    });
});
