import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #397", () => {
    it("should not error when getting properties from type", () => {
        const text = `
interface Foo {
    a: number,
    b: number,
}
export type Picked = Pick<Foo, "a">`;
        const { sourceFile } = getInfoFromText(text, { includeLibDts: true });
        const typeAlias = sourceFile.getTypeAliasOrThrow("Picked");

        expect(typeAlias.getType().getProperties().map(p => p.getName())).to.deep.equal(["a"]);
    });
});
