import { ts } from "../../../typescript";
import { ProjectContext } from "../../../ProjectContext";
import { Memoize } from "../../../utils";
import { FileTextChanges } from "./FileTextChanges";

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

    // TODO: getCommands
}
