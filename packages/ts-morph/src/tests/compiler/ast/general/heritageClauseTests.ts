import { ArrayUtils, nameof } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, HeritageClause } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("HeritageClause", () => {
  describe(nameof<HeritageClause>("getTypeNodes"), () => {
    const { firstChild } = getInfoFromText<ClassDeclaration>("export class Identifier extends Base implements IBase, IBase2 {}");
    const heritageClauses = firstChild.getHeritageClauses();
    const types = heritageClauses.map(c => c.getTypeNodes()).flat();

    it("should get all the type nodes", () => {
      expect(types.length).to.equal(3);
    });
  });
});
