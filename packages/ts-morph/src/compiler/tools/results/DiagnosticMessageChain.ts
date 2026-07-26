import { DiagnosticCategory, ts } from "@ts-morph/common";

/**
 * A link in a diagnostic's message chain.
 *
 * Breaking change: tsgo has no separate message chain type — a chain element is
 * itself a `Diagnostic`, nested under the parent's `messageChain`. So this wraps
 * a `ts.Diagnostic`, and `getNext()` reads `messageChain` rather than `next`.
 */
export class DiagnosticMessageChain {
  /** @internal */
  readonly _compilerObject: ts.Diagnostic;

  /** @private */
  constructor(compilerObject: ts.Diagnostic) {
    this._compilerObject = compilerObject;
  }

  /**
   * Gets the underlying compiler object.
   */
  get compilerObject(): ts.Diagnostic {
    return this._compilerObject;
  }

  /**
   * Gets the message text.
   */
  getMessageText(): string {
    return this.compilerObject.text;
  }

  /**
   * Gets the next diagnostic message chains in the chain.
   */
  getNext(): DiagnosticMessageChain[] | undefined {
    const next = this.compilerObject.messageChain;
    if (next == null)
      return undefined;
    return next.map(n => new DiagnosticMessageChain(n));
  }

  /**
   * Gets the code of the diagnostic message chain.
   */
  getCode() {
    return this.compilerObject.code;
  }

  /**
   * Gets the category of the diagnostic message chain.
   */
  getCategory(): DiagnosticCategory {
    return this.compilerObject.category;
  }
}
