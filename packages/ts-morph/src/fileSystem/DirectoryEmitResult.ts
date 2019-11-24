import { StandardizedFilePath } from "@ts-morph/common";

export class DirectoryEmitResult {
    /** @private */
    constructor(private readonly _skippedFilePaths: ReadonlyArray<StandardizedFilePath>,
        private readonly _outputFilePaths: ReadonlyArray<StandardizedFilePath>)
    {
    }

    /** Gets a collections of skipped file paths. */
    getSkippedFilePaths() {
        return this._skippedFilePaths as StandardizedFilePath[];
    }

    /**
     * Gets the output file paths.
     */
    getOutputFilePaths() {
        return this._outputFilePaths as StandardizedFilePath[];
    }
}
