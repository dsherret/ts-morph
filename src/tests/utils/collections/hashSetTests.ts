import { expect } from "chai";
import { ArrayUtils } from "../../../utils";
import { Es5HashSet } from "../../../utils/collections/Es5HashSet";

describe(nameof(Es5HashSet), () => {
    function runTest<T>(value: T) {
        const hashSet = new Es5HashSet<T>();
        expect(ArrayUtils.from(hashSet.values())).to.deep.equal([]);
        expect(hashSet.has(value)).to.be.false;
        hashSet.add(value);
        expect(ArrayUtils.from(hashSet.values())).to.deep.equal([value]);
        expect(hashSet.has(value)).to.be.true;
        expect(hashSet.delete(value)).to.be.true;
        expect(hashSet.delete(value)).to.be.false;
        expect(ArrayUtils.from(hashSet.values())).to.deep.equal([]);
        expect(hashSet.has(value)).to.be.false;
    }

    it("should add values to the hash set and say they exist when they do for strings", () => {
        runTest("");
    });

    it("should add values to the hash set and say they exist when they do for numbers", () => {
        runTest(5);
    });

    it("should add values to the hash set and say they exist when they do for objects", () => {
        runTest({ test: "string" });
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
