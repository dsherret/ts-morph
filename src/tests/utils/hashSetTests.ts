import {expect} from "chai";
import {Es5HashSet, ArrayUtils} from "./../../utils";

describe(nameof(Es5HashSet), () => {
    it("should add values to the hash set and say they exist when they do", () => {
        const hashSet = new Es5HashSet<string>();
        expect(ArrayUtils.from(hashSet.values())).to.deep.equal([]);
        expect(hashSet.has("")).to.be.false;
        hashSet.add("");
        expect(ArrayUtils.from(hashSet.values())).to.deep.equal([""]);
        expect(hashSet.has("")).to.be.true;
        expect(hashSet.delete("")).to.be.true;
        expect(hashSet.delete("")).to.be.false;
        expect(ArrayUtils.from(hashSet.values())).to.deep.equal([]);
        expect(hashSet.has("")).to.be.false;
    });
});
