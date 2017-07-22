import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {DocumentSpan} from "./DocumentSpan";

export class ReferenceEntry extends DocumentSpan<ts.ReferenceEntry> {
    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: ts.ReferenceEntry) {
        super(global, compilerObject);
    }

    getIsWriteAccess() {
        // todo: not sure what this does
        return this.compilerObject.isWriteAccess;
    }

    /**
     * If this is the definition reference.
     */
    getIsDefinition() {
        return this.compilerObject.isDefinition;
    }

    getIsInString() {
        // todo: not sure what this does and why it can be undefined
        return this.compilerObject.isInString;
    }
}
