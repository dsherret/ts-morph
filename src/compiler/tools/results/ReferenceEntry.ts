import {ts} from "./../../../typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {DocumentSpan} from "./DocumentSpan";

export class ReferenceEntry extends DocumentSpan<ts.ReferenceEntry> {
    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: ts.ReferenceEntry) {
        super(global, compilerObject);
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
