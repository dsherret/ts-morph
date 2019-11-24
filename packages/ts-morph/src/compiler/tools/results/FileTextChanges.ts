import { SourceFile } from "../../../compiler";
import { errors, Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { TextChange } from "./TextChange";

export interface ApplyFileTextChangesOptions {
    /**
     * If a file should be overwritten when the file text change is for a new file, but the file currently exists.
     */
    overwrite?: boolean;
}

export class FileTextChanges {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.FileTextChanges;
    /** @internal */
    private readonly _sourceFile: SourceFile | undefined;
    /** @internal */
    private readonly _existingFileExists: boolean;
    /** @internal */
    private _isApplied: true | undefined;

    /** @private */
    constructor(context: ProjectContext, compilerObject: ts.FileTextChanges) {
        this._context = context;
        this._compilerObject = compilerObject;

        const file = context.compilerFactory
            .getSourceFileFromCacheFromFilePath(context.fileSystemWrapper.getStandardizedAbsolutePath(compilerObject.fileName));
        this._existingFileExists = file != null;
        if (!compilerObject.isNewFile)
            this._sourceFile = file;
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
     * Applies the text changes to the file. This modifies and possibly creates a new source file.
     *
     * WARNING: This will forget any previously navigated descendant nodes in the source file.
     * @param options - Options for applying the text changes to the file.
     */
    applyChanges(options: ApplyFileTextChangesOptions = {}) {
        if (this._isApplied)
            return;

        if (this.isNewFile() && this._existingFileExists && !options.overwrite) {
            throw new errors.InvalidOperationError(
                `Cannot apply file text change for creating a new file when the `
                    + `file exists at path ${this.getFilePath()}. Did you mean to provide the overwrite option?`
            );
        }

        let file: SourceFile | undefined;
        if (this.isNewFile())
            file = this._context.project.createSourceFile(this.getFilePath(), "", { overwrite: options.overwrite });
        else
            file = this.getSourceFile();

        if (file == null) {
            throw new errors.InvalidOperationError(
                `Cannot apply file text change to modify existing file `
                    + `that doesn't exist at path: ${this.getFilePath()}`
            );
        }

        file.applyTextChanges(this.getTextChanges());
        this._isApplied = true;

        return this;
    }

    /**
     * Gets if this change is for creating a new file.
     */
    isNewFile() {
        return !!this._compilerObject.isNewFile;
    }
}
