import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {EnumMember} from "./../enum";
import {Node, Symbol, Signature, Expression} from "./../common";
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
     * Gets the apparent type of a type.
     * @param type - Type to get the apparent type of.
     */
    getApparentType(type: Type) {
        return this.factory.getType(this.typeChecker.getApparentType(type.getCompilerType()));
    }

    /**
     * Gets the constant value of a declaration.
     * @param node - Node to get the constant value from.
     */
    getConstantValue(node: EnumMember) {
        return this.typeChecker.getConstantValue(node.getCompilerNode());
    }

    /**
     * Gets the fully qualified name of a symbol.
     * @param symbol - Symbol to get the fully qualified name of.
     */
    getFullyQualifiedName(symbol: Symbol) {
        return this.typeChecker.getFullyQualifiedName(symbol.getCompilerSymbol());
    }

    /**
     * Gets the type at the specified location.
     * @param node - Node to get the type for.
     */
    getTypeAtLocation(node: Node): Type {
        return this.factory.getType(this.typeChecker.getTypeAtLocation(node.getCompilerNode()));
    }

    /**
     * Gets the contextual type of an expression.
     * @param expression - Expression.
     */
    getContextualType(expression: Expression): Type | undefined {
        const contextualType = this.typeChecker.getContextualType(expression.getCompilerNode());
        return contextualType == null ? undefined : this.factory.getType(contextualType);
    }

    /**
     * Gets the type of a symbol at the specified location.
     * @param symbol - Symbol to get the type for.
     * @param node - Location to get the type for.
     */
    getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type {
        return this.factory.getType(this.typeChecker.getTypeOfSymbolAtLocation(symbol.getCompilerSymbol(), node.getCompilerNode()));
    }

    /**
     * Gets the declared type of a symbol.
     * @param symbol - Symbol to get the type for.
     */
    getDeclaredTypeOfSymbol(symbol: Symbol): Type {
        return this.factory.getType(this.typeChecker.getDeclaredTypeOfSymbol(symbol.getCompilerSymbol()));
    }

    /**
     * Gets the symbol at the specified location or undefined if none exists.
     * @param node - Node to get the symbol for.
     */
    getSymbolAtLocation(node: Node): Symbol | undefined {
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
     * Gets the properties of a type.
     * @param type - Type.
     */
    getPropertiesOfType(type: Type) {
        return this.typeChecker.getPropertiesOfType(type.getCompilerType()).map(p => this.factory.getSymbol(p));
    }

    /**
     * Gets the type text
     * @param type - Type to get the text of.
     * @param enclosingNode - Enclosing node.
     * @param typeFormatFlags - Type format flags.
     */
    getTypeText(type: Type, enclosingNode?: Node, typeFormatFlags?: ts.TypeFormatFlags) {
        if (typeFormatFlags == null)
            typeFormatFlags = this.getDefaultTypeFormatFlags(enclosingNode);

        const compilerNode = enclosingNode == null ? undefined : enclosingNode.getCompilerNode();
        return this.typeChecker.typeToString(type.getCompilerType(), compilerNode, typeFormatFlags);
    }

    /**
     * Gets the return type of a signature.
     * @param signature - Signature to get the return type of.
     */
    getReturnTypeOfSignature(signature: Signature): Type {
        return this.factory.getType(this.typeChecker.getReturnTypeOfSignature(signature.getCompilerSignature()));
    }

    /**
     * Gets a signature from a node.
     * @param node - Node to get the signature from.
     */
    getSignatureFromNode(node: Node<ts.SignatureDeclaration>): Signature {
        return this.factory.getSignature(this.typeChecker.getSignatureFromDeclaration(node.getCompilerNode()));
    }

    private getDefaultTypeFormatFlags(enclosingNode?: Node) {
        let formatFlags = (ts.TypeFormatFlags.UseTypeOfFunction | ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType |
            ts.TypeFormatFlags.WriteTypeArgumentsOfSignature) as ts.TypeFormatFlags;

        if (enclosingNode != null && enclosingNode.getKind() === ts.SyntaxKind.TypeAliasDeclaration)
            formatFlags |= ts.TypeFormatFlags.InTypeAlias;

        return formatFlags;
    }
}
