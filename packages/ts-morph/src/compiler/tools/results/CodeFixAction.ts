import { ts } from "@ts-morph/common";
import { CodeAction } from "./CodeAction";

/**
 * Represents a code fix action.
 */
export class CodeFixAction extends CodeAction<ts.CodeFixAction> {
    /**
     * Short name to identify the fix, for use by telemetry.
     */
    getFixName() {
        return this.compilerObject.fixName;
    }

    /**
     * If present, one may call 'getCombinedCodeFix' with this fixId.
     * This may be omitted to indicate that the code fix can't be applied in a group.
     */
    getFixId() {
        return this.compilerObject.fixId;
    }

    /**
     * Gets the description of the code fix when fixing everything.
     */
    getFixAllDescription() {
        return this.compilerObject.fixAllDescription;
    }
}
