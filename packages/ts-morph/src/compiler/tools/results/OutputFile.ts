import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";

/**
 * Output file of an emit.
 */
export class OutputFile {
    /** @internal */
    private readonly _compilerObject: ts.OutputFile;
    /** @internal */
    private readonly _context: ProjectContext;

    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.OutputFile) {
        this._compilerObject = compilerObject;
        this._context = context;
    }

    /**
     * TypeScript compiler output file.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the file path.
     */
    getFilePath() {
        return this._context.fileSystemWrapper.getStandardizedAbsolutePath(this.compilerObject.name);
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
