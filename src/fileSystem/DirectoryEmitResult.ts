export class DirectoryEmitResult {
    /** @internal */
    constructor(private readonly _emitSkipped: boolean, private readonly _outputFilePaths: string[]) {
    }

    /**
     * Gets if the emit was skipped.
     */
    getEmitSkipped() {
        return this._emitSkipped;
    }

    /**
     * Gets the output file paths.
     */
    getOutputFilePaths() {
        return this._outputFilePaths;
    }
}
