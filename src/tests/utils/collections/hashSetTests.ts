import { expect } from "chai";
import { ArrayUtils, Es5HashSet } from "../../../utils";

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

    describe(nameof<Es5HashSet<any>>(s => s.clear), () => {
        it("should clear the added values", () => {
            const hashSet = new Es5HashSet<number>();
            hashSet.add(1);
            hashSet.add(2);
            hashSet.clear();
            expect(ArrayUtils.from(hashSet.values())).to.deep.equal([]);
        });
    });
});
