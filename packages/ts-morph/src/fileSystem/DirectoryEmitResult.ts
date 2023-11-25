import { StandardizedFilePath } from "@ts-morph/common";

export class DirectoryEmitResult {
  readonly #outputFilePaths: ReadonlyArray<StandardizedFilePath>;
  readonly #skippedFilePaths: ReadonlyArray<StandardizedFilePath>;

  /** @private */
  constructor(_skippedFilePaths: ReadonlyArray<StandardizedFilePath>, _outputFilePaths: ReadonlyArray<StandardizedFilePath>) {
    this.#skippedFilePaths = _skippedFilePaths;
    this.#outputFilePaths = _outputFilePaths;
  }

  /** Gets a collections of skipped file paths. */
  getSkippedFilePaths() {
    return this.#skippedFilePaths as StandardizedFilePath[];
  }

  /**
   * Gets the output file paths.
   */
  getOutputFilePaths() {
    return this.#outputFilePaths as StandardizedFilePath[];
  }
}
