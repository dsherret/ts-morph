import { StandardizedFilePath } from "@ts-morph/common";

export class DirectoryEmitResult {
    readonly #_outputFilePaths: ReadonlyArray<StandardizedFilePath>;
    readonly #_skippedFilePaths: ReadonlyArray<StandardizedFilePath>;

  /** @private */
  constructor(_skippedFilePaths: ReadonlyArray<StandardizedFilePath>, _outputFilePaths: ReadonlyArray<StandardizedFilePath>) {
      this.#_skippedFilePaths = _skippedFilePaths;
      this.#_outputFilePaths = _outputFilePaths;
  }

  /** Gets a collections of skipped file paths. */
  getSkippedFilePaths() {
    return this.#_skippedFilePaths as StandardizedFilePath[];
  }

  /**
   * Gets the output file paths.
   */
  getOutputFilePaths() {
    return this.#_outputFilePaths as StandardizedFilePath[];
  }
}
