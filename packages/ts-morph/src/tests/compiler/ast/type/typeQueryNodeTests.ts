import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TypeQueryNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("TypeQueryNode", () => {
    function getTypeQueryNode(text: string) {
        const { sourceFile } = getInfoFromText(text);
        return sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.TypeQuery);
    }

    describe(nameof.property<TypeQueryNode>("getExprName"), () => {
        it("should get", () => {
            expect(getTypeQueryNode("const test: typeof Test").getExprName().getText(), "Test");
        });
    });
});
