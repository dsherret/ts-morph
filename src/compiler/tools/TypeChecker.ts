import { ProjectContext } from "../../ProjectContext";
import { SymbolFlags, SyntaxKind, ts, TypeFormatFlags } from "../../typescript";
import { Node, Signature, Symbol } from "../common";
import { EnumMember } from "../enum";
import { Expression } from "../expression";
import { ExportSpecifier } from "../file";
import { Type } from "../type";

/**
 * Wrapper around the TypeChecker.
 */
export class TypeChecker {
    /** @internal */
    private readonly context: ProjectContext;
    /** @internal */
    private _getCompilerObject!: () => ts.TypeChecker;

    /** @internal */
    constructor(context: ProjectContext) {
        this.context = context;
    }

    /**
     * Gets the compiler's TypeChecker.
     */
    get compilerObject() {
        return this._getCompilerObject();
    }

    /**
     * Resets the type checker.
     * @internal
     */
    reset(getTypeChecker: () => ts.TypeChecker) {
        this._getCompilerObject = getTypeChecker;
    }

    /**
     * Gets the apparent type of a type.
     * @param type - Type to get the apparent type of.
     */
    getApparentType(type: Type) {
        return this.context.compilerFactory.getType(this.compilerObject.getApparentType(type.compilerType));
    }

    /**
     * Gets the constant value of a declaration.
     * @param node - Node to get the constant value from.
     */
    getConstantValue(node: EnumMember) {
        return this.compilerObject.getConstantValue(node.compilerNode);
    }

    /**
     * Gets the fully qualified name of a symbol.
     * @param symbol - Symbol to get the fully qualified name of.
     */
    getFullyQualifiedName(symbol: Symbol) {
        return this.compilerObject.getFullyQualifiedName(symbol.compilerSymbol);
    }

    /**
     * Gets the type at the specified location.
     * @param node - Node to get the type for.
     */
    getTypeAtLocation(node: Node): Type {
        return this.context.compilerFactory.getType(this.compilerObject.getTypeAtLocation(node.compilerNode));
    }

    /**
     * Gets the contextual type of an expression.
     * @param expression - Expression.
     */
    getContextualType(expression: Expression): Type | undefined {
        const contextualType = this.compilerObject.getContextualType(expression.compilerNode);
        return contextualType == null ? undefined : this.context.compilerFactory.getType(contextualType);
    }

    /**
     * Gets the type of a symbol at the specified location.
     * @param symbol - Symbol to get the type for.
     * @param node - Location to get the type for.
     */
    getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type {
        return this.context.compilerFactory.getType(this.compilerObject.getTypeOfSymbolAtLocation(symbol.compilerSymbol, node.compilerNode));
    }

    /**
     * Gets the declared type of a symbol.
     * @param symbol - Symbol to get the type for.
     */
    getDeclaredTypeOfSymbol(symbol: Symbol): Type {
        return this.context.compilerFactory.getType(this.compilerObject.getDeclaredTypeOfSymbol(symbol.compilerSymbol));
    }

    /**
     * Gets the symbol at the specified location or undefined if none exists.
     * @param node - Node to get the symbol for.
     */
    getSymbolAtLocation(node: Node): Symbol | undefined {
        const compilerSymbol = this.compilerObject.getSymbolAtLocation(node.compilerNode);
        return compilerSymbol == null ? undefined : this.context.compilerFactory.getSymbol(compilerSymbol);
    }

    /**
     * Gets the aliased symbol of a symbol.
     * @param symbol - Symbol to get the alias symbol of.
     */
    getAliasedSymbol(symbol: Symbol): Symbol | undefined {
        if (!symbol.hasFlags(SymbolFlags.Alias))
            return undefined;

        const tsAliasSymbol = this.compilerObject.getAliasedSymbol(symbol.compilerSymbol);
        return tsAliasSymbol == null ? undefined : this.context.compilerFactory.getSymbol(tsAliasSymbol);
    }

    /**
     * Gets the properties of a type.
     * @param type - Type.
     */
    getPropertiesOfType(type: Type) {
        return this.compilerObject.getPropertiesOfType(type.compilerType).map(p => this.context.compilerFactory.getSymbol(p));
    }

    /**
     * Gets the type text
     * @param type - Type to get the text of.
     * @param enclosingNode - Enclosing node.
     * @param typeFormatFlags - Type format flags.
     */
    getTypeText(type: Type, enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags) {
        if (typeFormatFlags == null)
            typeFormatFlags = this.getDefaultTypeFormatFlags(enclosingNode);

        const compilerNode = enclosingNode == null ? undefined : enclosingNode.compilerNode;
        return this.compilerObject.typeToString(type.compilerType, compilerNode, typeFormatFlags);
    }

    /**
     * Gets the return type of a signature.
     * @param signature - Signature to get the return type of.
     */
    getReturnTypeOfSignature(signature: Signature): Type {
        return this.context.compilerFactory.getType(this.compilerObject.getReturnTypeOfSignature(signature.compilerSignature));
    }

    /**
     * Gets a signature from a node.
     * @param node - Node to get the signature from.
     */
getSignatureFromNode(node: Node<ts.SignatureDeclaration>): Signature | undefined {
    const signature = this.compilerObject.getSignatureFromDeclaration(node.compilerNode);
    return signature == null ? undefined : this.context.compilerFactory.getSignature(signature);
}

    /**
     * Gets the exports of a module.
     * @param moduleSymbol - Module symbol.
     */
    getExportsOfModule(moduleSymbol: Symbol) {
        const symbols = this.compilerObject.getExportsOfModule(moduleSymbol.compilerSymbol);
        return(symbols || []).map(s => this.context.compilerFactory.getSymbol(s));
    }

    /**
     * Gets the local target symbol of the provided export specifier.
     * @param exportSpecifier - Export specifier.
     */
    getExportSpecifierLocalTargetSymbol(exportSpecifier: ExportSpecifier) {
        const symbol = this.compilerObject.getExportSpecifierLocalTargetSymbol(exportSpecifier.compilerNode);
        return symbol == null ? undefined : this.context.compilerFactory.getSymbol(symbol);
    }

    /**
     * Gets the base type of a literal type.
     *
     * For example, for a number literal type it will return the number type.
     * @param type - Literal type to get the base type of.
     */
    getBaseTypeOfLiteralType(type: Type) {
        return this.context.compilerFactory.getType(this.compilerObject.getBaseTypeOfLiteralType(type.compilerType));
    }

    private getDefaultTypeFormatFlags(enclosingNode?: Node) {
        let formatFlags = (TypeFormatFlags.UseTypeOfFunction | TypeFormatFlags.NoTruncation | TypeFormatFlags.UseFullyQualifiedType |
            TypeFormatFlags.WriteTypeArgumentsOfSignature) as TypeFormatFlags;

        if (enclosingNode != null && enclosingNode.getKind() === SyntaxKind.TypeAliasDeclaration)
            formatFlags |= TypeFormatFlags.InTypeAlias;

        return formatFlags;
    }
}
