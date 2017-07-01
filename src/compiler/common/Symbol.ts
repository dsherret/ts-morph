import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {Node} from "./../common";
import {Type} from "./../type";

export class Symbol {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly _compilerSymbol: ts.Symbol;

    /**
     * Gets the underlying compiler symbol.
     */
    get compilerSymbol(): ts.Symbol {
        return this._compilerSymbol;
    }

    /**
     * Initializes a new instance of Symbol.
     * @internal
     * @param factory - Compiler factory.
     * @param symbol - Compiler symbol.
     */
    constructor(factory: CompilerFactory, symbol: ts.Symbol) {
        this.factory = factory;
        this._compilerSymbol = symbol;
    }

    /**
     * Gets the symbol name.
     */
    getName() {
        return this.compilerSymbol.getName();
    }

    /**
     * Gets the aliased symbol.
     */
    getAliasedSymbol(): Symbol | undefined {
        return this.factory.getTypeChecker().getAliasedSymbol(this);
    }

    /**
     * Gets the symbol flags.
     */
    getFlags(): ts.SymbolFlags {
        return this.compilerSymbol.getFlags();
    }

    /**
     * Gets if the symbol has the specified flags.
     * @param flags - Flags to check if the symbol has.
     */
    hasFlags(flags: ts.SymbolFlags) {
        return (this.compilerSymbol.flags & flags) === flags;
    }

    /**
     * Gets if the symbols are equal.
     * @param symbol - Other symbol to check.
     */
    equals(symbol: Symbol | undefined) {
        if (symbol == null)
            return false;
        return this.compilerSymbol === symbol.compilerSymbol;
    }

    /**
     * Gets the symbol declarations.
     */
    getDeclarations(): Node[] {
        // todo: is it important that this might return undefined in ts 2.4?
        return (this.compilerSymbol.getDeclarations() || []).map(d => this.factory.getNodeFromCompilerNode(d, this.factory.getSourceFileForNode(d)));
    }

    /**
     * Get the exports of the symbol.
     * @param name - Name of the export.
     */
    getExportByName(name: string): Symbol | undefined {
        if (this.compilerSymbol.exports == null)
            return undefined;

        const tsSymbol = this.compilerSymbol.exports!.get(name);
        return tsSymbol == null ? undefined : this.factory.getSymbol(tsSymbol);
    }

    /**
     * Gets the declared type of the symbol.
     */
    getDeclaredType(): Type {
        return this.factory.getTypeChecker().getDeclaredTypeOfSymbol(this);
    }

    /**
     * Gets the type of the symbol at a location.
     * @param node - Location to get the type at for this symbol.
     */
    getTypeAtLocation(node: Node) {
        return this.factory.getTypeChecker().getTypeOfSymbolAtLocation(this, node);
    }

    /**
     * Gets the fully qualified name.
     */
    getFullyQualifiedName() {
        return this.factory.getTypeChecker().getFullyQualifiedName(this);
    }
}
