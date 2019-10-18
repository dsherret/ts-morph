import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JSDocFunctionType } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(JSDocFunctionType), () => {
    function getInfo(text: string) {
        return getInfoFromTextWithDescendant<JSDocFunctionType>(text, SyntaxKind.JSDocFunctionType);
    }

    describe("general", () => {
        it("should get the js doc function type", () => {
            const { descendant } = getInfo("/** @type {function (): void} */let x;");
            expect(descendant).to.be.instanceOf(JSDocFunctionType);
            // the rest of these are tested in SignaturedDeclaration
            expect(descendant.getReturnType().getText()).to.equal("void");
        });
    });
});
