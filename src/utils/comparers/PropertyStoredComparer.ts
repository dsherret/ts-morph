import { StoredComparer } from "./StoredComparer";

export class PropertyStoredComparer<TValue, TProperty> implements StoredComparer<TValue> {
    constructor(private readonly getProperty: (value: TValue) => TProperty, private readonly comparer: StoredComparer<TProperty>) {
    }

    compareTo(value: TValue) {
        return this.comparer.compareTo(this.getProperty(value));
    }
}
