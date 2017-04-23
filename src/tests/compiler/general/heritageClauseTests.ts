import {expect} from "chai";
import {HeritageClause, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(HeritageClause), () => {
    describe(nameof<HeritageClause>(n => n.getTypes), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier extends Base implements IBase, IBase2 {}");
        const heritageClauses = firstChild.getHeritageClauses();
        const types = heritageClauses.map(c => c.getTypes()).reduce((a, b) => a.concat(b), []);

        it("should get all the types", () => {
            expect(types.length).to.equal(3);
        });
    });
});
