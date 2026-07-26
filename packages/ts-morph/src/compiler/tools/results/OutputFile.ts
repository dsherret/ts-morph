import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";

/**
 * Output file of an emit.
 *
 * Breaking change: `getWriteByteOrderMark()` is gone. tsgo does not model a byte
 * order mark on emit output, so there is nothing to report.
 */
export class OutputFile {
  /** @internal */
  readonly #compilerObject: ts.OutputFile;
  /** @internal */
  readonly #filePath: string;
  /** @internal */
  readonly #context: ProjectContext;

  /**
   * @private
   */
  constructor(context: ProjectContext, filePath: string, compilerObject: ts.OutputFile) {
    this.#compilerObject = compilerObject;
    this.#filePath = filePath;
    this.#context = context;
  }

  /**
   * TypeScript compiler output file.
   */
  get compilerObject() {
    return this.#compilerObject;
  }

  /**
   * Gets the file path.
   *
   * tsgo keys emit output by path rather than storing the path on the file, so
   * this comes from the map key the file was found under.
   */
  getFilePath() {
    return this.#context.fileSystemWrapper.getStandardizedAbsolutePath(this.#filePath);
  }

  /**
   * Gets the file text.
   */
  getText() {
    return this.compilerObject.text;
  }
}
