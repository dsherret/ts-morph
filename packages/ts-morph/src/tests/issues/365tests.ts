import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #365", () => {
    it("should replace that with this", () => {
        const text = `that.something.something2.something3;`;
        const { sourceFile } = getInfoFromText(text);
        const thatIdentifier = sourceFile.getFirstDescendantOrThrow(d => d.getKind() === SyntaxKind.Identifier && d.getText() === "that");

        const thisKeyword = thatIdentifier.replaceWithText("this");
        expect(sourceFile.getFullText()).to.equal(`this.something.something2.something3;`);
        expect(thisKeyword.getKind()).to.equal(SyntaxKind.ThisKeyword);
    });
});
