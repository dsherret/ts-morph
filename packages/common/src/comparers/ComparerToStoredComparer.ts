import { Comparer } from "./Comparer";
import { StoredComparer } from "./StoredComparer";

/**
 * Converts a comparer to a stored comparer.
 */
export class ComparerToStoredComparer<T> implements StoredComparer<T> {
  readonly #comparer: Comparer<T>;
  readonly #storedValue: T;
  /**
   * Constructor.
   * @param comparer - Comparer to use.
   * @param storedValue - Stored value to use as the value to always compare the input of `compareTo` to.
   */
  constructor(comparer: Comparer<T>, storedValue: T) {
    this.#comparer = comparer;
    this.#storedValue = storedValue;
  }

  /** @inheritdoc */
  compareTo(value: T) {
    return this.#comparer.compareTo(this.#storedValue, value);
  }
}
