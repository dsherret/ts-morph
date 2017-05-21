import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {Node} from "./../common";
import {Type} from "./../type";

export class Symbol {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly symbol: ts.Symbol;

    /**
     * Initializes a new instance of Symbol.
     * @internal
     * @param factory - Compiler factory.
     * @param symbol - Compiler symbol.
     */
    constructor(factory: CompilerFactory, symbol: ts.Symbol) {
        this.factory = factory;
        this.symbol = symbol;
    }

    /**
     * Gets the underlying compiler symbol.
     */
    getCompilerSymbol() {
        return this.symbol;
    }

    /**
     * Gets the symbol name.
     */
    getName() {
        return this.symbol.getName();
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
        return this.symbol.getFlags();
    }

    /**
     * Gets if the symbol has the specified flags.
     * @param flags - Flags to check if the symbol has.
     */
    hasFlags(flags: ts.SymbolFlags) {
        return (this.symbol.flags & flags) === flags;
    }

    /**
     * Gets if the symbols are equal.
     * @param symbol - Other symbol to check.
     */
    equals(symbol: Symbol | undefined) {
        if (symbol == null)
            return false;
        return this.symbol === symbol.symbol;
    }

    /**
     * Gets the symbol declarations.
     */
    getDeclarations(): Node[] {
        return this.symbol.getDeclarations().map(d => this.factory.getNodeFromCompilerNode(d));
    }

    /**
     * Get the exports of the symbol.
     * @param name - Name of the export.
     */
    getExportByName(name: string): Symbol | undefined {
        if (this.symbol.exports == null)
            return undefined;

        const tsSymbol = this.symbol.exports!.get(name);
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
