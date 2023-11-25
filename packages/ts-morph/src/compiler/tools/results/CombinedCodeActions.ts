import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { ApplyFileTextChangesOptions, FileTextChanges } from "./FileTextChanges";

/**
 * Represents file changes.
 *
 * @remarks Commands are currently not implemented.
 */
export class CombinedCodeActions {
  /** @internal */
  readonly #context: ProjectContext;
  /** @internal */
  readonly #compilerObject: ts.CombinedCodeActions;

  /** @private */
  constructor(context: ProjectContext, compilerObject: ts.CombinedCodeActions) {
    this.#context = context;
    this.#compilerObject = compilerObject;
  }

  /** Gets the compiler object. */
  get compilerObject() {
    return this.#compilerObject;
  }

  /** Text changes to apply to each file. */
  @Memoize
  getChanges() {
    return this.compilerObject.changes.map(change => new FileTextChanges(this.#context, change));
  }

  /**
   * Executes the combined code actions.
   *
   * WARNING: This will cause all nodes to be forgotten in the changed files.
   * @options - Options used when applying the changes.
   */
  applyChanges(options?: ApplyFileTextChangesOptions) {
    for (const change of this.getChanges())
      change.applyChanges(options);

    return this;
  }

  // TODO: commands property
}
