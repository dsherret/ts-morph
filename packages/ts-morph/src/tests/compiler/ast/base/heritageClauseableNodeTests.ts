import { expect } from "chai";
import { ClassDeclaration, HeritageClauseableNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("HeritageClauseableNode", () => {
    describe(nameof.property<HeritageClauseableNode>("getHeritageClauses"), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier extends Base implements IBase, IBase2 {}");
        const heritageClauses = firstChild.getHeritageClauses();

        it("should get all the heritage clauses", () => {
            expect(heritageClauses.length).to.equal(2);
        });
    });
});
