import { GlobalContainer } from "../../../GlobalContainer";
import { ts } from "../../../typescript";
import { Diagnostic } from "./Diagnostic";

export class DiagnosticWithLocation extends Diagnostic<ts.DiagnosticWithLocation> {
    /** @internal */
    constructor(global: GlobalContainer | undefined, compilerObject: ts.DiagnosticWithLocation) {
        super(global, compilerObject);
    }

    /**
     * Gets the line number.
     */
    getLineNumber() {
        return super.getLineNumber()!;
    }

    /**
     * Gets the start.
     */
    getStart() {
        return super.getStart()!;
    }

    /**
     * Gets the length
     */
    getLength() {
        return super.getLength()!;
    }

    /**
     * Gets the source file.
     */
    getSourceFile() {
        return super.getSourceFile()!;
    }
}
