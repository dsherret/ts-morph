import { ArrayUtils } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, HeritageClause } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(HeritageClause), () => {
    describe(nameof<HeritageClause>(n => n.getTypeNodes), () => {
        const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier extends Base implements IBase, IBase2 {}");
        const heritageClauses = firstChild.getHeritageClauses();
        const types = ArrayUtils.flatten(heritageClauses.map(c => c.getTypeNodes()));

        it("should get all the type nodes", () => {
            expect(types.length).to.equal(3);
        });
    });
});
