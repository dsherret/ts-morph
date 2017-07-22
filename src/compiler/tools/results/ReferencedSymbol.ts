import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {Memoize} from "./../../../utils";
import {ReferenceEntry} from "./ReferenceEntry";
import {ReferencedSymbolDefinitionInfo} from "./ReferencedSymbolDefinitionInfo";

/**
 * Referenced symbol.
 */
export class ReferencedSymbol {
    /** @internal */
    protected readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerObject: ts.ReferencedSymbol;

    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: ts.ReferencedSymbol) {
        this.global = global;
        this._compilerObject = compilerObject;
    }

    /**
     * Gets the compiler referenced symbol.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the definition.
     */
    @Memoize
    getDefinition() {
        return new ReferencedSymbolDefinitionInfo(this.global, this.compilerObject.definition);
    }

    /**
     * Gets the references.
     */
    @Memoize
    getReferences() {
        return this.compilerObject.references.map(r => new ReferenceEntry(this.global, r));
    }
}
