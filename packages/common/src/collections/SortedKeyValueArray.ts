import { ArrayUtils } from "../utils";
import { Comparer, PropertyComparer, ComparerToStoredComparer, PropertyStoredComparer } from "../comparers";

/**
 * An array where the values are sorted by a key of one of the values.
 */
export class SortedKeyValueArray<TKey, TValue> {
    private readonly array: TValue[] = [];

    constructor(private readonly getKey: (value: TValue) => TKey, private readonly comparer: Comparer<TKey>) {
    }

    set(value: TValue) {
        ArrayUtils.binaryInsertWithOverwrite(this.array, value, new PropertyComparer<TValue, TKey>(this.getKey, this.comparer));
    }

    removeByValue(value: TValue) {
        this.removeByKey(this.getKey(value));
    }

    removeByKey(key: TKey) {
        const storedComparer = new ComparerToStoredComparer<TKey>(this.comparer, key);
        const index = ArrayUtils.binarySearch(this.array, new PropertyStoredComparer<TValue, TKey>(this.getKey, storedComparer));

        if (index >= 0)
            this.array.splice(index, 1);
    }

    getArrayCopy() {
        return [...this.array];
    }

    hasItems() {
        return this.array.length > 0;
    }

    *entries() {
        yield* this.array;
    }
}
