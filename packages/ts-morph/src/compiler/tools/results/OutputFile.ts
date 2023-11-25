import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";

/**
 * Output file of an emit.
 */
export class OutputFile {
  /** @internal */
  readonly #compilerObject: ts.OutputFile;
  /** @internal */
  readonly #context: ProjectContext;

  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: ts.OutputFile) {
    this.#compilerObject = compilerObject;
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
   */
  getFilePath() {
    return this.#context.fileSystemWrapper.getStandardizedAbsolutePath(this.compilerObject.name);
  }

  /**
   * Gets whether the byte order mark should be written.
   */
  getWriteByteOrderMark() {
    return this.compilerObject.writeByteOrderMark || false;
  }

  /**
   * Gets the file text.
   */
  getText() {
    return this.compilerObject.text;
  }
}
