import { ts } from "@ts-morph/common";

/**
 * Symbol display part.
 */
export class SymbolDisplayPart {
  /** @internal */
  readonly #compilerObject: ts.SymbolDisplayPart;

  /** @private */
  constructor(compilerObject: ts.SymbolDisplayPart) {
    this.#compilerObject = compilerObject;
  }

  /** Gets the compiler symbol display part. */
  get compilerObject() {
    return this.#compilerObject;
  }

  /**
   * Gets the text.
   */
  getText() {
    return this.compilerObject.text;
  }

  /**
   * Gets the kind.
   *
   * Breaking change: tsgo renders documentation as plain text rather than a
   * classified part list, so this is always `"text"`.
   */
  getKind() {
    return this.compilerObject.kind;
  }
}
