import { ts } from "@ts-morph/common";

/**
 * JS doc tag info.
 */
export class JSDocTagInfo {
  /** @internal */
  readonly #compilerObject: ts.JSDocTagInfo;

  /** @private */
  constructor(compilerObject: ts.JSDocTagInfo) {
    this.#compilerObject = compilerObject;
  }

  /** Gets the compiler JS doc tag info. */
  get compilerObject() {
    return this.#compilerObject;
  }

  /**
   * Gets the name.
   */
  getName() {
    return this.compilerObject.name;
  }

  /**
   * Gets the text.
   */
  getText() {
    return this.compilerObject.text ?? [];
  }
}
