import { expect } from "chai";
import { JSDocTypeExpression, Node } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";
import { nameof } from "@ts-morph/common";

describe("JSDocTypeExpression", () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(Node.isJSDocTypeExpression), ...info };
    }

    describe(nameof.property<JSDocTypeExpression>("getTypeNode"), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getTypeNode().getText()).to.equal(expected);
        }

        it("should get when type is given", () => {
            doTest("/** @param {boolean} t - String */\nfunction test() {}", "boolean");
        });
    });
});
