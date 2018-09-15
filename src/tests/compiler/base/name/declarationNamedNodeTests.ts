import { expect } from "chai";
import { FunctionDeclaration, ParameterDeclaration, DeclarationNamedNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(DeclarationNamedNode), () => {
    // todo: other tests

    describe(nameof<ParameterDeclaration>(n => n.fill), () => {
        it("should fill the node with a new name via a rename", () => {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>("function test(p) {}");
            firstChild.getParameters()[0].fill({ name: "newName" });
            expect(sourceFile.getFullText()).to.equal("function test(newName) {}");
        });
    });

    describe(nameof<ParameterDeclaration>(n => n.getStructure), () => {
        it("should get the name", () => {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>("function test(p) {}");
            expect(firstChild.getParameters()[0].getStructure().name).to.equal("p");
        });
    });
});
