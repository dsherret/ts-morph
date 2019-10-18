/**
 * Compares two values specifying the sort order.
 */
export interface Comparer<T> {
    /**
     * Checks the two items returning -1 if `a` preceeds, 0 if equal, and 1 if `a` follows.
     * @param a - Item to use.
     * @param b - Item to compare with.
     */
    compareTo(a: T, b: T): number;
}
