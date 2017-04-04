import {expect} from "chai";
import {ArrayUtils} from "./../../utils";

describe(nameof(ArrayUtils), () => {
    describe(`#${nameof(ArrayUtils.isNullOrEmpty)}()`, () => {
        it("should return true when null", () => {
            expect(ArrayUtils.isNullOrEmpty(null as any)).to.equal(true);
        });

        it("should return true when undefined", () => {
            expect(ArrayUtils.isNullOrEmpty(undefined as any)).to.equal(true);
        });

        it("should return true when empty", () => {
            expect(ArrayUtils.isNullOrEmpty([])).to.equal(true);
        });

        it("should return false when not empty", () => {
            expect(ArrayUtils.isNullOrEmpty([1])).to.equal(false);
        });
    });

    describe(`#${nameof(ArrayUtils.getUniqueItems)}()`, () => {
        it("should return all the unique items in the array", () => {
            expect(ArrayUtils.getUniqueItems([1, 2, 3, 3, 2, 1])).to.eql([1, 2, 3]);
        });
    });

    describe(`#${nameof(ArrayUtils.removeFirst)}()`, () => {
        it("should remove the first value", () => {
            const a = [1, 2, 3, 3];
            const result = ArrayUtils.removeFirst(a, 3);
            expect(a).to.eql([1, 2, 3]);
            expect(result).to.equal(true);
        });

        it("should not remove if not found", () => {
            const a = [1, 2, 3, 3];
            const result = ArrayUtils.removeFirst(a, 4);
            expect(a).to.eql([1, 2, 3, 3]);
            expect(result).to.equal(false);
        });
    });
});
