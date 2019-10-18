import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { ApplyFileTextChangesOptions, FileTextChanges } from "./FileTextChanges";

/**
 * Set of edits to make in response to a refactor action, plus an optional location where renaming should be invoked from.
 */
export class RefactorEditInfo {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.RefactorEditInfo;

    /** @private */
    constructor(context: ProjectContext, compilerObject: ts.RefactorEditInfo) {
        this._context = context;
        this._compilerObject = compilerObject;
    }

    /** Gets the compiler refactor edit info. */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets refactor file text changes
     */
    @Memoize
    getEdits() {
        return this.compilerObject.edits.map(edit => new FileTextChanges(this._context, edit));
    }

    /**
     * Gets the file path for a rename refactor.
     */
    getRenameFilePath() {
        return this.compilerObject.renameFilename;
    }

    /**
     * Location where renaming should be invoked from.
     */
    getRenameLocation() {
        return this.compilerObject.renameLocation;
    }

    /**
     * Executes the combined code actions.
     *
     * WARNING: This will cause all nodes to be forgotten in the changed files.
     * @options - Options used when applying the changes.
     */
    applyChanges(options?: ApplyFileTextChangesOptions) {
        for (const change of this.getEdits())
            change.applyChanges(options);

        return this;
    }

    // TODO: getCommands
}
