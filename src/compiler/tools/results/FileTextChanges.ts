import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { TextChange } from "./TextChange";

export class FileTextChanges {
    /** @internal */
    private readonly _compilerObject: ts.FileTextChanges;

    /**
     * @internal
     */
    constructor(compilerObject: ts.FileTextChanges) {
        this._compilerObject = compilerObject;
    }

    /**
     * Gets the file path.
     */
    getFilePath() {
        return this._compilerObject.fileName;
    }

    /**
     * Gets the text changes
     */
    @Memoize
    getTextChanges() {
        return this._compilerObject.textChanges.map(c => new TextChange(c));
    }

    /**
     * Should the file be created?
     */
    isNewFile() {
        return this._compilerObject.isNewFile;
    }

    /**
     * Creates a new FileTextChange from compiler object.
     */
    static create(compilerObject: ts.FileTextChanges) {
        return new FileTextChanges(compilerObject);
    }
}
