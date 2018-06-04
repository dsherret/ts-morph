import { SourceFile } from "../../../compiler";
import { GlobalContainer } from "../../../GlobalContainer";
import { DiagnosticCategory, ts } from "../../../typescript";
import { DiagnosticMessageChain } from "./DiagnosticMessageChain";

/**
 * Diagnostic.
 */
export class Diagnostic<TCompilerObject extends ts.Diagnostic = ts.Diagnostic> {
    /** @internal */
    readonly global: GlobalContainer | undefined;
    /** @internal */
    readonly _compilerObject: TCompilerObject;

    /** @internal */
    constructor(global: GlobalContainer | undefined, compilerObject: TCompilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
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
    getSourceFile(): SourceFile | undefined {
        if (this.global == null)
            return undefined;
        const file = this.compilerObject.file;
        return file == null ? undefined : this.global.compilerFactory.getSourceFile(file);
    }

    /**
     * Gets the message text.
     */
    getMessageText(): string | DiagnosticMessageChain {
        const messageText = this._compilerObject.messageText;
        if (typeof messageText === "string")
            return messageText;

        if (this.global == null)
            return new DiagnosticMessageChain(messageText);
        else
            return this.global.compilerFactory.getDiagnosticMessageChain(messageText);
    }

    /**
     * Gets the line number.
     */
    getLineNumber() {
        const sourceFile = this.getSourceFile();
        const start = this.getStart();
        if (sourceFile == null || start == null)
            return undefined;
        return sourceFile.getLineNumberFromPos(start);
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
