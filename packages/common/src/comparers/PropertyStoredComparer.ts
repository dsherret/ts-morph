import { StoredComparer } from "./StoredComparer";

/**
 * A stored comparer that compares a property to a stored value.
 */
export class PropertyStoredComparer<TValue, TProperty> implements StoredComparer<TValue> {
    /**
     * Constructor.
     * @param getProperty - Gets the property from the value.
     * @param comparer - Comparer to compare the property with.
     */
    constructor(private readonly getProperty: (value: TValue) => TProperty, private readonly comparer: StoredComparer<TProperty>) {
    }

    /** @inheritdoc */
    compareTo(value: TValue) {
        return this.comparer.compareTo(this.getProperty(value));
    }
}
