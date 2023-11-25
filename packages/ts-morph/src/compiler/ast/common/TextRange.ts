import { errors, ts } from "@ts-morph/common";
import { SourceFile } from "../module";

export class TextRange<TRange extends ts.TextRange = ts.TextRange> {
  /** @internal */
  #compilerObject: TRange | undefined;
  /** @internal */
  #sourceFile: SourceFile | undefined;

  /**
   * @private
   */
  constructor(compilerObject: TRange, sourceFile: SourceFile) {
    this.#compilerObject = compilerObject;
    this.#sourceFile = sourceFile;
  }

  /**
   * Gets the underlying compiler object.
   */
  get compilerObject(): TRange {
    this.#throwIfForgotten();
    return this.#compilerObject!;
  }

  /**
   * Gets the source file of the text range.
   */
  getSourceFile() {
    this.#throwIfForgotten();
    return this.#sourceFile!;
  }

  /**
   * Gets the position.
   */
  getPos() {
    return this.compilerObject.pos;
  }

  /**
   * Gets the end.
   */
  getEnd() {
    return this.compilerObject.end;
  }

  /**
   * Gets the width of the text range.
   */
  getWidth() {
    return this.getEnd() - this.getPos();
  }

  /**
   * Gets the text of the text range.
   */
  getText() {
    const fullText = this.getSourceFile().getFullText();
    return fullText.substring(this.compilerObject.pos, this.compilerObject.end);
  }

  /**
   * Forgets the text range.
   * @internal
   */
  _forget() {
    this.#compilerObject = undefined;
    this.#sourceFile = undefined;
  }

  /**
   * Gets if the text range was forgotten.
   *
   * This will be true after any manipulations have occured to the source file this text range was generated from.
   */
  wasForgotten() {
    return this.#compilerObject == null;
  }

  /** @internal */
  #throwIfForgotten() {
    if (this.#compilerObject != null)
      return;
    const message = "Attempted to get a text range that was forgotten. "
      + "Text ranges are forgotten after a manipulation has occurred. "
      + "Please re-request the text range after manipulations.";
    throw new errors.InvalidOperationError(message);
  }
}
