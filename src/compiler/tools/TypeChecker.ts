import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {EnumMemberDeclaration} from "./../enum";
import {Node, Symbol, Signature} from "./../common";
import {Type} from "./../type";

/**
 * Wrapper around the TypeChecker.
 */
export class TypeChecker {
    /** @internal */
    private readonly factory: CompilerFactory;

    /** @internal */
    constructor(factory: CompilerFactory, private readonly typeChecker: ts.TypeChecker) {
        this.factory = factory;
    }

    /**
     * Gets the compiler's TypeChecker.
     */
    getCompilerTypeChecker() {
        return this.typeChecker;
    }

    /**
     * Gets the constant value of a declaration.
     * @param node - Node to get the constant value from.
     */
    getConstantValue(node: EnumMemberDeclaration) {
        return this.typeChecker.getConstantValue(node.getCompilerNode());
    }

    /**
     * Gets the type at the specified location.
     * @param node - Node to get the type for.
     */
    getTypeAtLocation(node: Node<ts.Node>): Type {
        return this.factory.getType(this.typeChecker.getTypeAtLocation(node.getCompilerNode()), node);
    }

    /**
     * Gets the symbol at the specified location or undefined if none exists.
     * @param node - Node to get the symbol for.
     */
    getSymbolAtLocation(node: Node<ts.Node>): Symbol | undefined {
        const compilerSymbol = this.typeChecker.getSymbolAtLocation(node.getCompilerNode());
        return compilerSymbol == null ? undefined : this.factory.getSymbol(compilerSymbol);
    }

    /**
     * Gets the aliased symbol of a symbol.
     * @param symbol - Symbol to get the alias symbol of.
     */
    getAliasedSymbol(symbol: Symbol): Symbol | undefined {
        if (!symbol.hasFlags(ts.SymbolFlags.Alias))
            return undefined;

        const tsAliasSymbol = this.typeChecker.getAliasedSymbol(symbol.getCompilerSymbol());
        return tsAliasSymbol == null ? undefined : this.factory.getSymbol(tsAliasSymbol);
    }

    /**
     * Gets the type text
     * @param type - Type to get the text of.
     * @param enclosingNode - Enclosing node.
     * @param typeFormatFlags - Type format flags.
     */
    getTypeText(type: Type, enclosingNode: Node<ts.Node>, typeFormatFlags?: ts.TypeFormatFlags) {
        if (typeFormatFlags == null)
            typeFormatFlags = this.getDefaultTypeFormatFlags(enclosingNode);

        return this.typeChecker.typeToString(type.getCompilerType(), enclosingNode.getCompilerNode(), typeFormatFlags);
    }

    /**
     * Gets the return type of a signature.
     * @param signature - Signature to get the return type of.
     */
    getReturnTypeOfSignature(signature: Signature): Type {
        return this.factory.getType(this.typeChecker.getReturnTypeOfSignature(signature.getCompilerSignature()), signature.getEnclosingNode());
    }

    /**
     * Gets a signature from a node.
     * @param node - Node to get the signature from.
     */
    getSignatureFromNode(node: Node<ts.SignatureDeclaration>): Signature {
        return this.factory.getSignature(this.typeChecker.getSignatureFromDeclaration(node.getCompilerNode()), node);
    }

    private getDefaultTypeFormatFlags(enclosingNode: Node<ts.Node>) {
        let formatFlags = (ts.TypeFormatFlags.UseTypeOfFunction | ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType |
            ts.TypeFormatFlags.WriteTypeArgumentsOfSignature) as ts.TypeFormatFlags;

        if (enclosingNode.getKind() === ts.SyntaxKind.TypeAliasDeclaration)
            formatFlags |= ts.TypeFormatFlags.InTypeAlias;

        return formatFlags;
    }
}
