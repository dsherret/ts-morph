import { StoredComparer } from "./StoredComparer";

/**
 * A stored comparer that compares a property to a stored value.
 */
export class PropertyStoredComparer<TValue, TProperty> implements StoredComparer<TValue> {
    readonly #comparer: StoredComparer<TProperty>;
    readonly #getProperty: (value: TValue) => TProperty;

  /**
   * Constructor.
   * @param getProperty - Gets the property from the value.
   * @param comparer - Comparer to compare the property with.
   */
  constructor(getProperty: (value: TValue) => TProperty, comparer: StoredComparer<TProperty>) {
      this.#getProperty = getProperty;
      this.#comparer = comparer;
  }

  /** @inheritdoc */
  compareTo(value: TValue) {
    return this.#comparer.compareTo(this.#getProperty(value));
  }
}
