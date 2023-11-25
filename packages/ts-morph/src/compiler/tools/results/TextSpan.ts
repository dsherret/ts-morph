import { ts } from "@ts-morph/common";

/**
 * Represents a span of text.
 */
export class TextSpan {
  /** @internal */
  readonly #compilerObject: ts.TextSpan;

  /** @private */
  constructor(compilerObject: ts.TextSpan) {
    this.#compilerObject = compilerObject;
  }

  /** Gets the compiler text span. */
  get compilerObject() {
    return this.#compilerObject;
  }

  /**
   * Gets the start.
   */
  getStart() {
    return this.compilerObject.start;
  }

  /**
   * Gets the start + length.
   */
  getEnd() {
    return this.compilerObject.start + this.compilerObject.length;
  }

  /**
   * Gets the length.
   */
  getLength() {
    return this.compilerObject.length;
  }
}
