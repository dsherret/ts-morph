import {ts} from "./../../../typescript";

/**
 * Output file of an emit.
 */
export class OutputFile {
    /** @internal */
    private readonly _compilerObject: ts.OutputFile;

    /**
     * @internal
     */
    constructor(compilerObject: ts.OutputFile) {
        this._compilerObject = compilerObject;
    }

    /**
     * TypeScript compiler emit result.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the file path.
     */
    getFilePath() {
        return this.compilerObject.name;
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
