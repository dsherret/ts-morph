import { errors, ts } from "@ts-morph/common";
import { SourceFile } from "../module";

export class TextRange<TRange extends ts.TextRange = ts.TextRange> {
    /** @internal */
    private _compilerObject: TRange | undefined;
    /** @internal */
    private _sourceFile: SourceFile | undefined;

    /**
     * @private
     */
    constructor(compilerObject: TRange, sourceFile: SourceFile) {
        this._compilerObject = compilerObject;
        this._sourceFile = sourceFile;
    }

    /**
     * Gets the underlying compiler object.
     */
    get compilerObject(): TRange {
        this._throwIfForgotten();
        return this._compilerObject!;
    }

    /**
     * Gets the source file of the text range.
     */
    getSourceFile() {
        this._throwIfForgotten();
        return this._sourceFile!;
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
     * Gets the width of the text range.
     */
    getWidth() {
        return this.getEnd() - this.getPos();
    }

    /**
     * Gets the text of the text range.
     */
    getText() {
        const fullText = this.getSourceFile().getFullText();
        return fullText.substring(this.compilerObject.pos, this.compilerObject.end);
    }

    /**
     * Forgets the text range.
     * @internal
     */
    _forget() {
        this._compilerObject = undefined;
        this._sourceFile = undefined;
    }

    /**
     * Gets if the text range was forgotten.
     *
     * This will be true after any manipulations have occured to the source file this text range was generated from.
     */
    wasForgotten() {
        return this._compilerObject == null;
    }

    /** @internal */
    private _throwIfForgotten() {
        if (this._compilerObject != null)
            return;
        const message = "Attempted to get a text range that was forgotten. "
            + "Text ranges are forgotten after a manipulation has occurred. "
            + "Please re-request the text range after manipulations.";
        throw new errors.InvalidOperationError(message);
    }
}
