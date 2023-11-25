import { Comparer, ComparerToStoredComparer, PropertyComparer, PropertyStoredComparer } from "../comparers";
import { ArrayUtils } from "../utils";

/**
 * An array where the values are sorted by a key of one of the values.
 */
export class SortedKeyValueArray<TKey, TValue> {
  readonly #array: TValue[] = [];
  readonly #getKey: (value: TValue) => TKey;
  readonly #comparer: Comparer<TKey>;

  constructor(getKey: (value: TValue) => TKey, comparer: Comparer<TKey>) {
    this.#getKey = getKey;
    this.#comparer = comparer;
  }

  set(value: TValue) {
    ArrayUtils.binaryInsertWithOverwrite(this.#array, value, new PropertyComparer<TValue, TKey>(this.#getKey, this.#comparer));
  }

  removeByValue(value: TValue) {
    this.removeByKey(this.#getKey(value));
  }

  removeByKey(key: TKey) {
    const storedComparer = new ComparerToStoredComparer<TKey>(this.#comparer, key);
    const index = ArrayUtils.binarySearch(this.#array, new PropertyStoredComparer<TValue, TKey>(this.#getKey, storedComparer));

    if (index >= 0)
      this.#array.splice(index, 1);
  }

  getArrayCopy() {
    return [...this.#array];
  }

  hasItems() {
    return this.#array.length > 0;
  }

  *entries() {
    yield* this.#array;
  }
}
