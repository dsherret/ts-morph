import { Comparer } from "./Comparer";
import { StoredComparer } from "./StoredComparer";

export class ComparerToStoredComparer<T> implements StoredComparer<T> {
    constructor(private readonly comparer: Comparer<T>, private readonly storedValue: T) {
    }

    compareTo(value: T) {
        return this.comparer.compareTo(this.storedValue, value);
    }
}
