/**
 * Compares a value against a stored value.
 */
export interface StoredComparer<T> {
    /**
     * Checks the value against a stored value returning -1 if the stored value preceeds, 0 if the value is equal, and 1 if follows.
     * @param value - Value to compare.
     */
    compareTo(value: T): number;
}
