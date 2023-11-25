import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { FileTextChanges } from "./FileTextChanges";

/**
 * Represents a code action.
 */
export class CodeAction<TCompilerObject extends ts.CodeAction = ts.CodeAction> {
  /** @internal */
  readonly #context: ProjectContext;
  /** @internal */
  readonly #compilerObject: TCompilerObject;

  /** @private */
  constructor(context: ProjectContext, compilerObject: TCompilerObject) {
    this.#context = context;
    this.#compilerObject = compilerObject;
  }

  /** Gets the compiler object. */
  get compilerObject() {
    return this.#compilerObject;
  }

  /** Description of the code action. */
  getDescription() {
    return this.compilerObject.description;
  }

  /** Text changes to apply to each file as part of the code action. */
  getChanges() {
    return this.compilerObject.changes.map(change => new FileTextChanges(this.#context, change));
  }

  // TODO: commands property
}
