import { expect } from "chai";
import { ArrayUtils } from "../../utils";
import { Comparer, ComparerToStoredComparer } from "../../comparers";

describe(nameof(ArrayUtils), () => {
    class NumberComparer implements Comparer<number> {
        compareTo(a: number, b: number) {
            if (a < b)
                return -1;
            else if (a === b)
                return 0;
            return 1;
        }
    }

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

    describe(`#${nameof(ArrayUtils.removeAll)}()`, () => {
        it("should remove every item that matches", () => {
            const a = [3, 1, 2, 3, 3];
            const result = ArrayUtils.removeAll(a, i => i === 3);
            expect(a).to.eql([1, 2]);
            expect(result).to.deep.equal([3, 3, 3]);
        });
    });

    describe(`#${nameof(ArrayUtils.binarySearch)}()`, () => {
        function doTest(items: number[], value: number, expectedValue: number) {
            const result = ArrayUtils.binarySearch(items, new ComparerToStoredComparer(new NumberComparer(), value));
            expect(result).to.equal(expectedValue);
        }

        it("should find the value is at the beginning of the array", () => {
            doTest([1, 2, 3, 4], 1, 0);
        });

        it("should find the value is at the end of the array", () => {
            doTest([1, 2, 3, 4], 4, 3);
        });

        it("should find the value right before the middle in an even length array", () => {
            doTest([1, 2, 3, 4], 2, 1);
        });

        it("should find the value right after the middle in an even length array", () => {
            doTest([1, 2, 3, 4], 3, 2);
        });

        it("should find the value right before the middle in an odd length array", () => {
            doTest([1, 2, 3, 4, 5], 2, 1);
        });

        it("should find the value in the middle in an odd length array", () => {
            doTest([1, 2, 3, 4, 5], 3, 2);
        });

        it("should find the value right after the middle in an odd length array", () => {
            doTest([1, 2, 3, 4, 5], 4, 3);
        });

        it("should not find a number in the middle of the array that doesn't exist", () => {
            doTest([1, 2, 4, 5, 6], 3, -1);
        });

        it("should not find a number beyond the left of the array", () => {
            doTest([1, 2, 3, 4, 5], 0, -1);
        });

        it("should not find a number beyond the right of the array", () => {
            doTest([1, 2, 3, 4, 5], 6, -1);
        });
    });

    describe(`#${nameof(ArrayUtils.binaryInsertWithOverwrite)}()`, () => {
        function doTest(items: number[], value: number, expectedItems: number[]) {
            ArrayUtils.binaryInsertWithOverwrite(items, value, new NumberComparer());
            expect(items).to.deep.equal(expectedItems);
        }

        it("should add a number in the correct place in an odd position", () => {
            doTest([1, 2, 4], 3, [1, 2, 3, 4]);
        });

        it("should add a number in the correct place in an even position", () => {
            doTest([1, 2, 3, 5], 4, [1, 2, 3, 4, 5]);
        });

        it("should add a number in the correct place at the beginning", () => {
            doTest([1, 2, 3, 5], 0, [0, 1, 2, 3, 5]);
        });

        it("should add a number in the correct place at the end", () => {
            doTest([1, 2, 3, 5], 6, [1, 2, 3, 5, 6]);
        });

        it("should overwrite when equal", () => {
            doTest([1, 2, 3, 5], 5, [1, 2, 3, 5]);
        });
    });

    describe(`#${nameof(ArrayUtils.containsSubArray)}()`, () => {
        function doTest(items: number[], subArray: number[], result: boolean) {
            expect(ArrayUtils.containsSubArray(items, subArray)).equal(result);
        }

        it("should be true when it contains the sub array at the start", () => {
            doTest([1, 2, 3, 4, 5], [1, 2, 3], true);
        });

        it("should be true when it contains the sub array at the end", () => {
            doTest([1, 2, 3, 4, 5], [3, 4, 5], true);
        });

        it("should be true when it contains the sub array in the middle", () => {
            doTest([1, 2, 3, 4, 5], [2, 3, 4], true);
        });

        it("should be false when it doesn't contain the sub array", () => {
            doTest([1, 2, 3, 4, 5], [1, 2, 2], false);
        });

        it("should be false when it doesn't contain the sub array in a different order", () => {
            doTest([1, 2, 3, 4, 5], [3, 2, 1], false);
        });

        it("should be false when it doesn't contain all the sub array", () => {
            doTest([1, 2, 3, 4, 5], [3, 4, 5, 6], false);
        });
    });

    describe(`#${nameof(ArrayUtils.groupBy)}()`, () => {
        it("should group by the specified property", () => {
            const items = [{ id: 1, name: "Name1" }, { id: 3, name: "Name2" }, { id: 2, name: "Name1" }];
            const result = ArrayUtils.groupBy(items, item => item.name);
            expect(result).to.deep.equal([[items[0], items[2]], [items[1]]]);
        });
    });
});
