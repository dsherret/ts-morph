import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { ReferenceEntry } from "./ReferenceEntry";

/**
 * Referenced symbol.
 */
export class ReferencedSymbol {
    /** @internal */
    protected readonly _context: ProjectContext;
    /** @internal */
    private readonly _compilerObject: ts.ReferencedSymbol;
    /** @internal */
    private readonly _references: ReferenceEntry[];

    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.ReferencedSymbol) {
        this._context = context;
        this._compilerObject = compilerObject;

        // it's important to store the references so that the nodes referenced inside will point
        // to the right node in case the user does manipulation between getting this object and getting the references
        this._references = this.compilerObject.references.map(r => context.compilerFactory.getReferenceEntry(r));
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
        return this._context.compilerFactory.getReferencedSymbolDefinitionInfo(this.compilerObject.definition);
    }

    /**
     * Gets the references.
     */
    getReferences() {
        return this._references;
    }
}
