import * as errors from "../../errors";
import { ts } from "../../typescript";
import { SourceFile } from "../file";

export class CommentRange {
    /** @internal */
    private _compilerObject: ts.CommentRange | undefined;
    /** @internal */
    private _sourceFile: SourceFile | undefined;

    /**
     * @internal
     */
    constructor(compilerObject: ts.CommentRange, sourceFile: SourceFile) {
        this._compilerObject = compilerObject;
        this._sourceFile = sourceFile;
    }

    /**
     * Gets the underlying compiler object.
     */
    get compilerObject(): ts.CommentRange {
        this._throwIfForgotten();
        return this._compilerObject!;
    }

    /**
     * Gets the source file of the comment range.
     */
    getSourceFile() {
        this._throwIfForgotten();
        return this._sourceFile!;
    }

    /**
     * Gets the comment syntax kind.
     */
    getKind(): ts.CommentKind {
        return this.compilerObject.kind;
    }

    /**
     * Gets the position.
     */
    getPos() {
        return this.compilerObject.pos;
    }

    /**
     * Gets the end.
     */
    getEnd() {
        return this.compilerObject.end;
    }

    /**
     * Gets the width of the comment range.
     */
    getWidth() {
        return this.getEnd() - this.getPos();
    }

    /**
     * Gets the text of the comment range.
     */
    getText() {
        const fullText = this.getSourceFile().getFullText();
        return fullText.substring(this.compilerObject.pos, this.compilerObject.end);
    }

    /**
     * Forgets the comment range.
     * @internal
     */
    forget() {
        this._compilerObject = undefined;
        this._sourceFile = undefined;
    }

    /**
     * Gets if the comment range was forgotten.
     *
     * This will be true after any manipulations have occured to the source file this comment range was generated from.
     */
    wasForgotten() {
        return this._compilerObject == null;
    }

    private _throwIfForgotten() {
        if (this._compilerObject != null)
            return;
        const message = "Attempted to get a comment range that was forgotten. " +
            "Comment ranges are forgotten after a manipulation has occurred. " +
            "Please re-request the comment range from the node.";
        throw new errors.InvalidOperationError(message);
    }
}
