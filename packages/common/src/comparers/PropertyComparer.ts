import { Comparer } from "./Comparer";

/**
 * Compares two values based on one of their properties.
 */
export class PropertyComparer<TValue, TProperty> implements Comparer<TValue> {
    readonly #comparer: Comparer<TProperty>;
    readonly #getProperty: (value: TValue) => TProperty;

  /**
   * Constructor.
   * @param getProperty - Gets the property from the value to use for comparisons.
   * @param comparer - Comparer to compare the properties with.
   */
  constructor(getProperty: (value: TValue) => TProperty, comparer: Comparer<TProperty>) {
      this.#getProperty = getProperty;
      this.#comparer = comparer;
  }

  /** @inheritdoc */
  compareTo(a: TValue, b: TValue) {
    return this.#comparer.compareTo(this.#getProperty(a), this.#getProperty(b));
  }
}
