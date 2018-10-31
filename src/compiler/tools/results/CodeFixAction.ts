import { ts } from "../../../typescript";
import { CodeAction } from "./CodeAction";

/**
 * Represents a code fix action
 */
export class CodeFixAction<TCompilerObject extends ts.CodeFixAction = ts.CodeFixAction> extends CodeAction<TCompilerObject> {

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

    getFixAllDescription() {
        return this.compilerObject.fixAllDescription;
    }

}
