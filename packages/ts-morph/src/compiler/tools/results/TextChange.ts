import { Memoize, ts } from "@ts-morph/common";
import { TextSpan } from "./TextSpan";

/**
 * Represents a text change.
 */
export class TextChange {
  /** @internal */
  readonly #compilerObject: ts.TextChange;

  /** @private */
  constructor(compilerObject: ts.TextChange) {
    this.#compilerObject = compilerObject;
  }

  /** Gets the compiler text change. */
  get compilerObject() {
    return this.#compilerObject;
  }

  /**
   * Gets the text span.
   */
  @Memoize
  getSpan() {
    return new TextSpan(this.compilerObject.span);
  }

  /**
   * Gets the new text.
   */
  getNewText() {
    return this.compilerObject.newText;
  }
}
