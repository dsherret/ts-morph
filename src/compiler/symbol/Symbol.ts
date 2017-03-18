import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {Node} from "./../common";

export class Symbol {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly symbol: ts.Symbol;

    /**
     * Initializes a new instance of Type.
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
     * Gets the symbol declarations.
     */
    getDeclarations(): Node<ts.Node>[] {
        return this.symbol.getDeclarations().map(d => this.factory.getNodeFromCompilerNode(d));
    }

    /**
     * Gets the symbol flags.
     */
    getFlags(): ts.SymbolFlags {
        return this.symbol.getFlags();
    }
}
