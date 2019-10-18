import { expect } from "chai";
import { SortedKeyValueArray } from "../../collections";
import { Comparer } from "../../comparers";

describe(nameof(SortedKeyValueArray), () => {
    class NumberComparer implements Comparer<number> {
        compareTo(a: number, b: number) {
            if (a < b)
                return -1;
            else if (a === b)
                return 0;
            return 1;
        }
    }

    describe(nameof<SortedKeyValueArray<any, any>>(a => a.set), () => {
        function doTest(startItems: number[], settingItem: number, expected: number[]) {
            const array = new SortedKeyValueArray<number, number>(value => value, new NumberComparer());
            startItems.forEach(item => array.set(item));
            array.set(settingItem);
            expect(array.getArrayCopy()).to.deep.equal(expected);
        }

        it("should add an item in the array at the start", () => {
            doTest([1, 2], 0, [0, 1, 2]);
        });

        it("should add an item in the array in the middle", () => {
            doTest([1, 6], 5, [1, 5, 6]);
        });

        it("should add an item in the array at the end", () => {
            doTest([1, 2], 3, [1, 2, 3]);
        });

        it("should overwrite a duplicate item", () => {
            doTest([1, 2], 2, [1, 2]);
        });
    });

    function doRemoveTests(removeFunction: (array: SortedKeyValueArray<number, number>, keyOrValue: number) => void) {
        function doTest(startItems: number[], keyOrValue: number, expected: number[]) {
            const array = new SortedKeyValueArray<number, number>(value => value, new NumberComparer());
            startItems.forEach(item => array.set(item));
            removeFunction(array, keyOrValue);
            expect(array.getArrayCopy()).to.deep.equal(expected);
        }

        it("should remove at the start", () => {
            doTest([1, 2], 1, [2]);
        });

        it("should remove in the middle", () => {
            doTest([1, 2, 3], 2, [1, 3]);
        });

        it("should remove at the end", () => {
            doTest([1, 2], 2, [1]);
        });

        it("should do nothing when it doesn't exist", () => {
            doTest([1, 2], 3, [1, 2]);
        });
    }

    describe(nameof<SortedKeyValueArray<any, any>>(a => a.removeByKey), () => {
        doRemoveTests((array, keyOrValue) => array.removeByKey(keyOrValue));
    });

    describe(nameof<SortedKeyValueArray<any, any>>(a => a.removeByValue), () => {
        doRemoveTests((array, keyOrValue) => array.removeByValue(keyOrValue));
    });

    describe(nameof<SortedKeyValueArray<any, any>>(a => a.hasItems), () => {
        function doTest(startItems: number[], expected: boolean) {
            const array = new SortedKeyValueArray<number, number>(value => value, new NumberComparer());
            startItems.forEach(item => array.set(item));
            expect(array.hasItems()).to.equal(expected);
        }

        it("should be true when has items", () => {
            doTest([1], true);
        });

        it("should be false when not has items", () => {
            doTest([], false);
        });
    });

    describe(nameof<SortedKeyValueArray<any, any>>(a => a.entries), () => {
        function doTest(startItems: number[]) {
            const array = new SortedKeyValueArray<number, number>(value => value, new NumberComparer());
            startItems.forEach(item => array.set(item));
            expect(Array.from(array.entries())).to.deep.equal(startItems);
        }

        it("should return the entries", () => {
            doTest([1, 2, 3, 4, 5]);
        });
    });
});
