import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { DocumentSpan } from "./DocumentSpan";

export class ReferenceEntry extends DocumentSpan<ts.ReferenceEntry> {
    /**
     * @internal
     */
    constructor(context: ProjectContext, compilerObject: ts.ReferenceEntry) {
        super(context, compilerObject);
    }

    isWriteAccess() {
        // todo: not sure what this does
        return this.compilerObject.isWriteAccess;
    }

    /**
     * If this is the definition reference.
     */
    isDefinition() {
        return this.compilerObject.isDefinition;
    }

    isInString() {
        // todo: not sure what this does and why it can be undefined
        return this.compilerObject.isInString;
    }
}
