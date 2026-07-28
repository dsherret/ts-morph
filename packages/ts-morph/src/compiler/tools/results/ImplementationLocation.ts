import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { DocumentSpan } from "./DocumentSpan";

/**
 * Location of an implementation.
 *
 * Breaking change: `getDisplayParts()` is gone. tsgo reports an implementation
 * as a file span, so the text that labels one — "(method) A.m(): void" — has
 * nowhere to come from.
 */
export class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
  // resolving the kind means finding the node and asking the checker, which is
  // wasted on a caller that only wants the spans
  readonly #getKind: () => ts.ScriptElementKind;

  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: ts.ImplementationLocation, getKind: () => ts.ScriptElementKind) {
    super(context, compilerObject);
    this.#getKind = getKind;
  }

  /**
   * Gets what kind of element the implementation is.
   *
   * Breaking change: the kind is worked out from the symbol at the span rather
   * than reported by the compiler, so the members are the ones
   * `ts.ScriptElementKind` kept — a class expression reads `class` where the
   * `typescript` package said `local class`.
   */
  @Memoize
  getKind(): ts.ScriptElementKind {
    return this.#getKind();
  }
}
