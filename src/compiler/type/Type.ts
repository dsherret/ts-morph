import {ts, TypeFlags, ObjectFlags, TypeFormatFlags} from "./../../typescript";
import * as errors from "./../../errors";
import {GlobalContainer} from "./../../GlobalContainer";
import {getSymbolByNameOrFindFunction} from "./../../utils";
import {Node} from "./../common/Node";
import {Symbol} from "./../common/Symbol";
import {Signature} from "./../common/Signature";
import {TypeParameter} from "./TypeParameter";

export class Type<TType extends ts.Type = ts.Type> {
    /** @internal */
    readonly global: GlobalContainer;
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
    getText(enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags): string {
        return this.global.typeChecker.getTypeText(this, enclosingNode, typeFormatFlags);
    }

    /**
     * Gets the alias symbol if it exists.
     */
    getAliasSymbol(): Symbol | undefined {
        return this.compilerType.aliasSymbol == null ? undefined : this.global.compilerFactory.getSymbol(this.compilerType.aliasSymbol);
    }

    /**
     * Gets the alias symbol if it exists, or throws.
     */
    getAliasSymbolOrThrow(): Symbol {
        return errors.throwIfNullOrUndefined(this.getAliasSymbol(), "Expected to find an alias symbol.");
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
    getApparentType(): Type {
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
     * Gets the target type of a type reference if it exists.
     */
    getTargetType(): Type<ts.GenericType> | undefined {
        const targetType = (this.compilerType as any as ts.TypeReference).target || undefined;
        return targetType == null ? undefined : this.global.compilerFactory.getType(targetType);
    }

    /**
     * Gets the target type of a type reference or throws if it doesn't exist.
     */
    getTargetTypeOrThrow(): Type<ts.GenericType> {
        return errors.throwIfNullOrUndefined(this.getTargetType(), "Expected to find the target type.");
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

        return (this.compilerType as any as ts.UnionType).types.map(t => this.global.compilerFactory.getType(t));
    }

    /**
     * Gets the intersection types.
     */
    getIntersectionTypes(): Type[] {
        if (!this.isIntersectionType())
            return [];

        return (this.compilerType as any as ts.IntersectionType).types.map(t => this.global.compilerFactory.getType(t));
    }

    /**
     * Gets the symbol of the type.
     */
    getSymbol(): Symbol | undefined {
        const tsSymbol = this.compilerType.getSymbol();
        return tsSymbol == null ? undefined : this.global.compilerFactory.getSymbol(tsSymbol);
    }

    /**
     * Gets the symbol of the type or throws.
     */
    getSymbolOrThrow(): Symbol {
        return errors.throwIfNullOrUndefined(this.getSymbol(), "Expected to find a symbol.");
    }

    /**
     * Gets if this is an anonymous type.
     */
    isAnonymousType() {
        return (this.getObjectFlags() & ObjectFlags.Anonymous) !== 0;
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
        return (this.compilerType.flags & TypeFlags.Boolean) !== 0;
    }

    /**
     * Gets if this is an enum type.
     */
    isEnumType() {
        return (this.compilerType.flags & TypeFlags.Enum) !== 0;
    }

    /**
     * Gets if this is an interface type.
     */
    isInterfaceType() {
        return (this.getObjectFlags() & ObjectFlags.Interface) !== 0;
    }

    /**
     * Gets if this is an intersection type.
     */
    isIntersectionType() {
        return (this.compilerType.flags & TypeFlags.Intersection) !== 0;
    }

    /**
     * Gets if this is an object type.
     */
    isObjectType() {
        return (this.compilerType.flags & TypeFlags.Object) !== 0;
    }

    /**
     * Gets if this is a type parameter.
     */
    isTypeParameter(): this is TypeParameter {
        return (this.compilerType.flags & TypeFlags.TypeParameter) !== 0;
    }

    /**
     * Gets if this is a union type.
     */
    isUnionType() {
        return (this.compilerType.flags & TypeFlags.Union) !== 0;
    }

    /**
     * Gets if this is the undefined type.
     */
    isUndefinedType() {
        return (this.compilerType.flags & TypeFlags.Undefined) !== 0;
    }

    /**
     * Gets the type flags.
     */
    getFlags(): TypeFlags {
        return this.compilerType.flags;
    }

    /**
     * Gets the object flags.
     */
    getObjectFlags() {
        if (!this.isObjectType())
            return 0;

        return (this.compilerType as any as ts.ObjectType).objectFlags || 0;
    }
}
