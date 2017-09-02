import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";
import {getSymbolByNameOrFindFunction} from "./../../utils";
import {Node} from "./../common/Node";
import {Symbol} from "./../common/Symbol";
import {Signature} from "./../common/Signature";

export class Type<TType extends ts.Type = ts.Type> {
    /** @internal */
    protected readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerType: TType;

    /**
     * Gets the underlying compiler type.
     */
    get compilerType() {
        return this._compilerType;
    }

    /**
     * Initializes a new instance of Type.
     * @internal
     * @param global - Global container.
     * @param type - Compiler type.
     */
    constructor(global: GlobalContainer, type: TType) {
        this.global = global;
        this._compilerType = type;
    }

    /**
     * Gets the type text.
     * @param enclosingNode - The enclosing node.
     * @param typeFormatFlags - Format flags for the type text.
     */
    getText(enclosingNode?: Node, typeFormatFlags?: ts.TypeFormatFlags) {
        return this.global.typeChecker.getTypeText(this, enclosingNode, typeFormatFlags);
    }

    /**
     * Gets the alias symbol if it exists.
     */
    getAliasSymbol(): Symbol | undefined {
        return this.compilerType.aliasSymbol == null ? undefined : this.global.compilerFactory.getSymbol(this.compilerType.aliasSymbol);
    }

    /**
     * Gets the alias type arguments.
     */
    getAliasTypeArguments(): Type[] {
        const aliasTypeArgs = this.compilerType.aliasTypeArguments || [];
        return aliasTypeArgs.map(t => this.global.compilerFactory.getType(t));
    }

    /**
     * Gets the apparent type.
     */
    getApparentType() {
        return this.global.typeChecker.getApparentType(this);
    }

    /**
     * Gets the array type
     */
    getArrayType() {
        if (!this.isArrayType())
            return undefined;
        return this.getTypeArguments()[0];
    }

    /**
     * Gets the base types.
     */
    getBaseTypes() {
        const baseTypes = this.compilerType.getBaseTypes() || [];
        return baseTypes.map(t => this.global.compilerFactory.getType(t));
    }

    /**
     * Gets the call signatures.
     */
    getCallSignatures(): Signature[] {
        return this.compilerType.getCallSignatures().map(s => this.global.compilerFactory.getSignature(s));
    }

    /**
     * Gets the construct signatures.
     */
    getConstructSignatures(): Signature[] {
        return this.compilerType.getConstructSignatures().map(s => this.global.compilerFactory.getSignature(s));
    }

    /**
     * Gets the properties of the type.
     */
    getProperties(): Symbol[] {
        return this.compilerType.getProperties().map(s => this.global.compilerFactory.getSymbol(s));
    }

    /**
     * Gets a property.
     * @param name - By a name.
     * @param findFunction - Function for searching for a property.
     */
    getProperty(name: string): Symbol | undefined;
    getProperty(findFunction: (declaration: Symbol) => boolean): Symbol | undefined;
    getProperty(nameOrFindFunction: string | ((declaration: Symbol) => boolean)): Symbol | undefined {
        return getSymbolByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
    }

    /**
     * Gets the apparent properties of the type.
     */
    getApparentProperties(): Symbol[] {
        return this.compilerType.getApparentProperties().map(s => this.global.compilerFactory.getSymbol(s));
    }

    /**
     * Gets an apparent property.
     * @param name - By a name.
     * @param findFunction - Function for searching for an apparent property.
     */
    getApparentProperty(name: string): Symbol | undefined;
    getApparentProperty(findFunction: (declaration: Symbol) => boolean): Symbol | undefined;
    getApparentProperty(nameOrFindFunction: string | ((declaration: Symbol) => boolean)): Symbol | undefined {
        return getSymbolByNameOrFindFunction(this.getApparentProperties(), nameOrFindFunction);
    }

    /**
     * Gets the non-nullable type.
     */
    getNonNullableType(): Type {
        return this.global.compilerFactory.getType(this.compilerType.getNonNullableType());
    }

    /**
     * Gets the number index type.
     */
    getNumberIndexType(): Type | undefined {
        const numberIndexType = this.compilerType.getNumberIndexType();
        return numberIndexType == null ? undefined : this.global.compilerFactory.getType(numberIndexType);
    }

    /**
     * Gets the string index type.
     */
    getStringIndexType(): Type | undefined {
        const stringIndexType = this.compilerType.getStringIndexType();
        return stringIndexType == null ? undefined : this.global.compilerFactory.getType(stringIndexType);
    }

    /**
     * Gets type arguments.
     */
    getTypeArguments(): Type[] {
        const typeArguments = (this.compilerType as any as ts.TypeReference).typeArguments || [];
        return typeArguments.map(t => this.global.compilerFactory.getType(t));
    }

    /**
     * Gets the union types.
     */
    getUnionTypes(): Type[] {
        if (!this.isUnionType())
            return [];

        return this.compilerType.types.map(t => this.global.compilerFactory.getType(t));
    }

    /**
     * Gets the intersection types.
     */
    getIntersectionTypes(): Type[] {
        if (!this.isIntersectionType())
            return [];

        return this.compilerType.types.map(t => this.global.compilerFactory.getType(t));
    }

    /**
     * Gets the symbol of the type.
     */
    getSymbol(): Symbol | undefined {
        const tsSymbol = this.compilerType.getSymbol();
        return tsSymbol == null ? undefined : this.global.compilerFactory.getSymbol(tsSymbol);
    }

    /**
     * Gets if this is an anonymous type.
     */
    isAnonymousType() {
        return (this.getObjectFlags() & ts.ObjectFlags.Anonymous) !== 0;
    }

    /**
     * Gets if this is an array type.
     */
    isArrayType() {
        const symbol = this.getSymbol();
        if (symbol == null)
            return false;
        return symbol.getName() === "Array" && this.getTypeArguments().length === 1;
    }

    /**
     * Gets if this is a boolean type.
     */
    isBooleanType() {
        return (this.compilerType.flags & ts.TypeFlags.Boolean) !== 0;
    }

    /**
     * Gets if this is an enum type.
     */
    isEnumType(): this is Type<ts.EnumType> {
        return (this.compilerType.flags & ts.TypeFlags.Enum) !== 0;
    }

    /**
     * Gets if this is an interface type.
     */
    isInterfaceType(): this is Type<ts.InterfaceType> {
        return (this.getObjectFlags() & ts.ObjectFlags.Interface) !== 0;
    }

    /**
     * Gets if this is an intersection type.
     */
    isIntersectionType(): this is Type<ts.UnionOrIntersectionType> {
        return (this.compilerType.flags & ts.TypeFlags.Intersection) !== 0;
    }

    /**
     * Gets if this is an object type.
     */
    isObjectType(): this is Type<ts.ObjectType> {
        return (this.compilerType.flags & ts.TypeFlags.Object) !== 0;
    }

    /**
     * Gets if this is a union type.
     */
    isUnionType(): this is Type<ts.UnionOrIntersectionType> {
        return (this.compilerType.flags & ts.TypeFlags.Union) !== 0;
    }

    /**
     * Gets the type flags.
     */
    getFlags(): ts.TypeFlags {
        return this.compilerType.flags;
    }

    /**
     * Gets the object flags.
     */
    getObjectFlags() {
        if (!this.isObjectType())
            return 0;

        return this.compilerType.objectFlags || 0;
    }
}
