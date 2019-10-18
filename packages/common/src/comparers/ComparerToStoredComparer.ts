import { Comparer } from "./Comparer";
import { StoredComparer } from "./StoredComparer";

/**
 * Converts a comparer to a stored comparer.
 */
export class ComparerToStoredComparer<T> implements StoredComparer<T> {
    /**
     * Constructor.
     * @param comparer - Comparer to use.
     * @param storedValue - Stored value to use as the value to always compare the input of `compareTo` to.
     */
    constructor(private readonly comparer: Comparer<T>, private readonly storedValue: T) {
    }

    /** @inheritdoc */
    compareTo(value: T) {
        return this.comparer.compareTo(this.storedValue, value);
    }
}
