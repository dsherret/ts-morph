import { SourceFile } from "../../../compiler";
import { ts } from "../../../typescript";
import { ProjectContext } from "../../../ProjectContext";
import { Memoize } from "../../../utils";
import { TextChange } from "./TextChange";

export class FileTextChanges {
    /** @internal */
    private readonly _compilerObject: ts.FileTextChanges;
    /** @internal */
    private readonly _sourceFile: SourceFile | undefined;

    /** @private */
    constructor(context: ProjectContext, compilerObject: ts.FileTextChanges) {
        this._compilerObject = compilerObject;
        this._sourceFile = context.compilerFactory.getSourceFileFromCacheFromFilePath(compilerObject.fileName);
    }

    /**
     * Gets the file path.
     */
    getFilePath() {
        return this._compilerObject.fileName;
    }

    /**
     * Gets the source file if it was in the cache at the time of this class' creation.
     */
    getSourceFile() {
        return this._sourceFile;
    }

    /**
     * Gets the text changes
     */
    @Memoize
    getTextChanges() {
        return this._compilerObject.textChanges.map(c => new TextChange(c));
    }

    /**
     * Gets if this change is for creating a new file.
     */
    isNewFile() {
        return !!this._compilerObject.isNewFile;
    }
}
