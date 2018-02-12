import {ts, DiagnosticCategory} from "./../../../typescript";
import {SourceFile} from "./../../../compiler";
import {GlobalContainer} from "./../../../GlobalContainer";
import {DiagnosticMessageChain} from "./DiagnosticMessageChain";

/**
 * Diagnostic.
 */
export class Diagnostic {
    /** @internal */
    readonly global: GlobalContainer | undefined;
    /** @internal */
    readonly _compilerObject: ts.Diagnostic;

    /** @internal */
    constructor(global: GlobalContainer | undefined, compilerObject: ts.Diagnostic) {
        this.global = global;
        this._compilerObject = compilerObject;
    }

    /**
     * Gets the underlying compiler diagnostic.
     */
    get compilerObject(): ts.Diagnostic {
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

        return new DiagnosticMessageChain(messageText);
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
