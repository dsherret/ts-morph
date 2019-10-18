import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { Diagnostic } from "./Diagnostic";

export class DiagnosticWithLocation extends Diagnostic<ts.DiagnosticWithLocation> {
    /** @private */
    constructor(context: ProjectContext | undefined, compilerObject: ts.DiagnosticWithLocation) {
        super(context, compilerObject);
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
