export class DirectoryEmitResult {
    /** @private */
    constructor(private readonly _skippedFilePaths: ReadonlyArray<string>, private readonly _outputFilePaths: ReadonlyArray<string>) {
    }

    /**
     * Gets if the emit was skipped.
     * @deprecated This is being deprecated in favour of getSkippedFilePaths().
     */
    getEmitSkipped() {
        return this._skippedFilePaths.length > 0;
    }

    /** Gets a collections of skipped file paths. */
    getSkippedFilePaths() {
        return this._skippedFilePaths as string[];
    }

    /**
     * Gets the output file paths.
     */
    getOutputFilePaths() {
        return this._outputFilePaths as string[];
    }
}
