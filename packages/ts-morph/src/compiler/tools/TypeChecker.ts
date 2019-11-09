import { ProjectContext } from "../../ProjectContext";
import { errors, SymbolFlags, SyntaxKind, ts, TypeFormatFlags } from "@ts-morph/common";
import { Signature, Symbol } from "../symbols";
import { Type } from "../types";
import { Node } from "../ast/common";
import { EnumMember } from "../ast/enum";
import { Expression } from "../ast/expression";
import { ExportSpecifier } from "../ast/module";
import { CallLikeExpression } from "../ast/aliases";

/**
 * Wrapper around the TypeChecker.
 */
export class TypeChecker {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private _getCompilerObject!: () => ts.TypeChecker;

    /** @private */
    constructor(context: ProjectContext) {
        this._context = context;
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
    _reset(getTypeChecker: () => ts.TypeChecker) {
        this._getCompilerObject = getTypeChecker;
    }

    /**
     * Gets the ambient module symbols (ex. modules in the @types folder or node_modules).
     */
    getAmbientModules() {
        return this.compilerObject.getAmbientModules().map(s => this._context.compilerFactory.getSymbol(s));
    }

    /**
     * Gets the apparent type of a type.
     * @param type - Type to get the apparent type of.
     */
    getApparentType(type: Type) {
        return this._context.compilerFactory.getType(this.compilerObject.getApparentType(type.compilerType));
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
        return this._context.compilerFactory.getType(this.compilerObject.getTypeAtLocation(node.compilerNode));
    }

    /**
     * Gets the contextual type of an expression.
     * @param expression - Expression.
     */
    getContextualType(expression: Expression): Type | undefined {
        const contextualType = this.compilerObject.getContextualType(expression.compilerNode);
        return contextualType == null ? undefined : this._context.compilerFactory.getType(contextualType);
    }

    /**
     * Gets the type of a symbol at the specified location.
     * @param symbol - Symbol to get the type for.
     * @param node - Location to get the type for.
     */
    getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type {
        return this._context.compilerFactory.getType(this.compilerObject.getTypeOfSymbolAtLocation(symbol.compilerSymbol, node.compilerNode));
    }

    /**
     * Gets the declared type of a symbol.
     * @param symbol - Symbol to get the type for.
     */
    getDeclaredTypeOfSymbol(symbol: Symbol): Type {
        return this._context.compilerFactory.getType(this.compilerObject.getDeclaredTypeOfSymbol(symbol.compilerSymbol));
    }

    /**
     * Gets the symbol at the specified location or undefined if none exists.
     * @param node - Node to get the symbol for.
     */
    getSymbolAtLocation(node: Node): Symbol | undefined {
        const compilerSymbol = this.compilerObject.getSymbolAtLocation(node.compilerNode);
        return compilerSymbol == null ? undefined : this._context.compilerFactory.getSymbol(compilerSymbol);
    }

    /**
     * Gets the aliased symbol of a symbol.
     * @param symbol - Symbol to get the alias symbol of.
     */
    getAliasedSymbol(symbol: Symbol): Symbol | undefined {
        if (!symbol.hasFlags(SymbolFlags.Alias))
            return undefined;

        const tsAliasSymbol = this.compilerObject.getAliasedSymbol(symbol.compilerSymbol);
        return tsAliasSymbol == null ? undefined : this._context.compilerFactory.getSymbol(tsAliasSymbol);
    }

    /**
     * Gets the export symbol of a local symbol with a corresponding export symbol. Otherwise returns the input symbol.
     *
     * The following is from the compiler API documentation:
     *
     * For example, at `export type T = number;`:
     *     - `getSymbolAtLocation` at the location `T` will return the exported symbol for `T`.
     *     - But the result of `getSymbolsInScope` will contain the *local* symbol for `T`, not the exported symbol.
     *     - Calling `getExportSymbolOfSymbol` on that local symbol will return the exported symbol.
     */
    getExportSymbolOfSymbol(symbol: Symbol) {
        return this._context.compilerFactory.getSymbol(this.compilerObject.getExportSymbolOfSymbol(symbol.compilerSymbol));
    }

    /**
     * Gets the properties of a type.
     * @param type - Type.
     */
    getPropertiesOfType(type: Type) {
        return this.compilerObject.getPropertiesOfType(type.compilerType).map(p => this._context.compilerFactory.getSymbol(p));
    }

    /**
     * Gets the type text
     * @param type - Type to get the text of.
     * @param enclosingNode - Enclosing node.
     * @param typeFormatFlags - Type format flags.
     */
    getTypeText(type: Type, enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags) {
        if (typeFormatFlags == null)
            typeFormatFlags = this._getDefaultTypeFormatFlags(enclosingNode);

        return this.compilerObject.typeToString(type.compilerType, enclosingNode?.compilerNode, typeFormatFlags);
    }

    /**
     * Gets the return type of a signature.
     * @param signature - Signature to get the return type of.
     */
    getReturnTypeOfSignature(signature: Signature): Type {
        return this._context.compilerFactory.getType(this.compilerObject.getReturnTypeOfSignature(signature.compilerSignature));
    }

    /**
     * Gets a signature from a node.
     * @param node - Node to get the signature from.
     */
    getSignatureFromNode(node: Node<ts.SignatureDeclaration>): Signature | undefined {
        const signature = this.compilerObject.getSignatureFromDeclaration(node.compilerNode);
        return signature == null ? undefined : this._context.compilerFactory.getSignature(signature);
    }

    /**
     * Gets the exports of a module.
     * @param moduleSymbol - Module symbol.
     */
    getExportsOfModule(moduleSymbol: Symbol) {
        const symbols = this.compilerObject.getExportsOfModule(moduleSymbol.compilerSymbol);
        return (symbols || []).map(s => this._context.compilerFactory.getSymbol(s));
    }

    /**
     * Gets the local target symbol of the provided export specifier.
     * @param exportSpecifier - Export specifier.
     */
    getExportSpecifierLocalTargetSymbol(exportSpecifier: ExportSpecifier) {
        const symbol = this.compilerObject.getExportSpecifierLocalTargetSymbol(exportSpecifier.compilerNode);
        return symbol == null ? undefined : this._context.compilerFactory.getSymbol(symbol);
    }

    /**
     * Gets the resolved signature from a node or returns undefined if the signature can't be resolved.
     * @param node - Node to get the signature from.
     */
    getResolvedSignature(node: CallLikeExpression) {
        const resolvedSignature = this.compilerObject.getResolvedSignature(node.compilerNode);
        if (!resolvedSignature || !resolvedSignature.declaration)
            return undefined;
        return this._context.compilerFactory.getSignature(resolvedSignature);
    }

    /**
     * Gets the resolved signature from a node or throws if the signature cannot be resolved.
     * @param node - Node to get the signature from.
     */
    getResolvedSignatureOrThrow(node: CallLikeExpression) {
        return errors.throwIfNullOrUndefined(this.getResolvedSignature(node), "Signature could not be resolved.");
    }

    /**
     * Gets the base type of a literal type.
     *
     * For example, for a number literal type it will return the number type.
     * @param type - Literal type to get the base type of.
     */
    getBaseTypeOfLiteralType(type: Type) {
        return this._context.compilerFactory.getType(this.compilerObject.getBaseTypeOfLiteralType(type.compilerType));
    }

    /**
     * Gets the symbols in the scope of the provided node.
     *
     * Note: This will always return the local symbols. If you want the export symbol from a local symbol, then
     * use the `#getExportSymbolOfSymbol(symbol)` method.
     * @param node - Node to check the scope for.
     * @param meaning - Meaning of symbol to filter by.
     */
    getSymbolsInScope(node: Node, meaning: SymbolFlags) {
        return this.compilerObject.getSymbolsInScope(node.compilerNode, meaning)
            .map(s => this._context.compilerFactory.getSymbol(s));
    }

    /**
     * Gets the type arguments from a type reference.
     * @param typeReference - Type reference.
     */
    getTypeArguments(typeReference: Type) {
        return this.compilerObject.getTypeArguments(typeReference.compilerType as ts.TypeReference)
            .map(arg => this._context.compilerFactory.getType(arg));
    }

    /** @internal */
    private _getDefaultTypeFormatFlags(enclosingNode?: Node) {
        let formatFlags = (TypeFormatFlags.UseTypeOfFunction | TypeFormatFlags.NoTruncation | TypeFormatFlags.UseFullyQualifiedType
            | TypeFormatFlags.WriteTypeArgumentsOfSignature) as TypeFormatFlags;

        if (enclosingNode != null && enclosingNode.getKind() === SyntaxKind.TypeAliasDeclaration)
            formatFlags |= TypeFormatFlags.InTypeAlias;

        return formatFlags;
    }
}
