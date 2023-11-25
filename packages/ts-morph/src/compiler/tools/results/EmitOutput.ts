import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { OutputFile } from "./OutputFile";

/**
 * Output of an emit on a single file.
 */
export class EmitOutput {
  /** @internal */
  readonly #context: ProjectContext;
  /** @internal */
  readonly #compilerObject: ts.EmitOutput;

  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: ts.EmitOutput) {
    this.#context = context;
    this.#compilerObject = compilerObject;
  }

  /**
   * TypeScript compiler emit result.
   */
  get compilerObject() {
    return this.#compilerObject;
  }

  /**
   * Gets if the emit was skipped.
   */
  getEmitSkipped() {
    return this.compilerObject.emitSkipped;
  }

  /**
   * Gets the output files.
   */
  @Memoize
  getOutputFiles() {
    return this.compilerObject.outputFiles.map(f => new OutputFile(this.#context, f));
  }
}
