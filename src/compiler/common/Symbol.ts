import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";
import {Node} from "./../common";
import {Type} from "./../type";

export class Symbol {
    /** @internal */
    private readonly global: GlobalContainer;
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
     * @param global - Global container.
     * @param symbol - Compiler symbol.
     */
    constructor(global: GlobalContainer, symbol: ts.Symbol) {
        this.global = global;
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
        return this.global.typeChecker.getAliasedSymbol(this);
    }

    /**
     * Gets if the symbol is an alias.
     */
    isAlias() {
        return (this.getFlags() & ts.SymbolFlags.Alias) === ts.SymbolFlags.Alias;
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
        return (this.compilerSymbol.declarations || []).map(d => this.global.compilerFactory.getNodeFromCompilerNode(d, this.global.compilerFactory.getSourceFileForNode(d)));
    }

    /**
     * Get the exports of the symbol.
     * @param name - Name of the export.
     */
    getExportByName(name: string): Symbol | undefined {
        if (this.compilerSymbol.exports == null)
            return undefined;

        const tsSymbol = this.compilerSymbol.exports!.get(name);
        return tsSymbol == null ? undefined : this.global.compilerFactory.getSymbol(tsSymbol);
    }

    /**
     * Gets the declared type of the symbol.
     */
    getDeclaredType(): Type {
        return this.global.typeChecker.getDeclaredTypeOfSymbol(this);
    }

    /**
     * Gets the type of the symbol at a location.
     * @param node - Location to get the type at for this symbol.
     */
    getTypeAtLocation(node: Node) {
        return this.global.typeChecker.getTypeOfSymbolAtLocation(this, node);
    }

    /**
     * Gets the fully qualified name.
     */
    getFullyQualifiedName() {
        return this.global.typeChecker.getFullyQualifiedName(this);
    }
}
