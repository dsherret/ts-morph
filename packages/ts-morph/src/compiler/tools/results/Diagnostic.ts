import { StringUtils, Memoize, DiagnosticCategory, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { SourceFile } from "../../ast";
import { DiagnosticMessageChain } from "./DiagnosticMessageChain";

/**
 * Diagnostic.
 */
export class Diagnostic<TCompilerObject extends ts.Diagnostic = ts.Diagnostic> {
    /** @internal */
    readonly _context: ProjectContext | undefined;
    /** @internal */
    readonly _compilerObject: TCompilerObject;

    /** @private */
    constructor(context: ProjectContext | undefined, compilerObject: TCompilerObject) {
        this._context = context;
        this._compilerObject = compilerObject;

        // memoize
        this.getSourceFile();
    }

    /**
     * Gets the underlying compiler diagnostic.
     */
    get compilerObject(): TCompilerObject {
        return this._compilerObject;
    }

    /**
     * Gets the source file.
     */
    @Memoize
    getSourceFile(): SourceFile | undefined {
        if (this._context == null)
            return undefined;
        const file = this.compilerObject.file;
        return file == null ? undefined : this._context.compilerFactory.getSourceFile(file, { markInProject: false });
    }

    /**
     * Gets the message text.
     */
    getMessageText(): string | DiagnosticMessageChain {
        const messageText = this._compilerObject.messageText;
        if (typeof messageText === "string")
            return messageText;

        if (this._context == null)
            return new DiagnosticMessageChain(messageText);
        else
            return this._context.compilerFactory.getDiagnosticMessageChain(messageText);
    }

    /**
     * Gets the line number.
     */
    getLineNumber() {
        const sourceFile = this.getSourceFile();
        const start = this.getStart();
        if (sourceFile == null || start == null)
            return undefined;
        return StringUtils.getLineNumberAtPos(sourceFile.getFullText(), start);
    }

    /**
     * Gets the start.
     */
    getStart() {
        return this.compilerObject.start;
    }

    /**
     * Gets the length.
     */
    getLength() {
        return this.compilerObject.length;
    }

    /**
     * Gets the diagnostic category.
     */
    getCategory(): DiagnosticCategory {
        return this.compilerObject.category;
    }

    /**
     * Gets the code of the diagnostic.
     */
    getCode() {
        return this.compilerObject.code;
    }

    /**
     * Gets the source.
     */
    getSource() {
        return this.compilerObject.source;
    }
}
