import * as errors from "../../errors";
import { ProjectContext } from "../../ProjectContext";
import { ObjectFlags, ts, TypeFlags, TypeFormatFlags } from "../../typescript";
import { getSymbolByNameOrFindFunction } from "../../utils";
import { Node } from "../common/Node";
import { Signature } from "../common/Signature";
import { Symbol } from "../common/Symbol";
import { TypeParameter } from "./TypeParameter";

export class Type<TType extends ts.Type = ts.Type> {
    /** @internal */
    readonly context: ProjectContext;
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
     * @param context - Project context.
     * @param type - Compiler type.
     */
    constructor(context: ProjectContext, type: TType) {
        this.context = context;
        this._compilerType = type;
    }

    /**
     * Gets the type text.
     * @param enclosingNode - The enclosing node.
     * @param typeFormatFlags - Format flags for the type text.
     */
    getText(enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags): string {
        return this.context.typeChecker.getTypeText(this, enclosingNode, typeFormatFlags);
    }

    /**
     * Gets the alias symbol if it exists.
     */
    getAliasSymbol(): Symbol | undefined {
        return this.compilerType.aliasSymbol == null ? undefined : this.context.compilerFactory.getSymbol(this.compilerType.aliasSymbol);
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
        return aliasTypeArgs.map(t => this.context.compilerFactory.getType(t));
    }

    /**
     * Gets the apparent type.
     */
    getApparentType(): Type {
        return this.context.typeChecker.getApparentType(this);
    }

    /**
     * Gets the array type
     */
    getArrayType() {
        if (!this.isArray())
            return undefined;
        return this.getTypeArguments()[0];
    }

    /**
     * Gets the base types.
     */
    getBaseTypes() {
        const baseTypes = this.compilerType.getBaseTypes() || [];
        return baseTypes.map(t => this.context.compilerFactory.getType(t));
    }

    /**
     * Gets the base type of a literal type.
     *
     * For example, for a number literal type it will return the number type.
     */
    getBaseTypeOfLiteralType() {
        return this.context.typeChecker.getBaseTypeOfLiteralType(this);
    }

    /**
     * Gets the call signatures.
     */
    getCallSignatures(): Signature[] {
        return this.compilerType.getCallSignatures().map(s => this.context.compilerFactory.getSignature(s));
    }

    /**
     * Gets the construct signatures.
     */
    getConstructSignatures(): Signature[] {
        return this.compilerType.getConstructSignatures().map(s => this.context.compilerFactory.getSignature(s));
    }

    /**
     * Gets the constraint or throws if it doesn't exist.
     */
    getConstraintOrThrow() {
        return errors.throwIfNullOrUndefined(this.getConstraint(), "Expected to find a constraint.");
    }

    /**
     * Gets the constraint or returns undefined if it doesn't exist.
     */
    getConstraint() {
        const constraint = this.compilerType.getConstraint();
        return constraint == null ? undefined : this.context.compilerFactory.getType(constraint);
    }

    /**
     * Gets the default type or throws if it doesn't exist.
     */
    getDefaultOrThrow() {
        return errors.throwIfNullOrUndefined(this.getDefault(), "Expected to find a constraint.");
    }

    /**
     * Gets the default type or returns undefined if it doesn't exist.
     */
    getDefault() {
        const defaultType = this.compilerType.getDefault();
        return defaultType == null ? undefined : this.context.compilerFactory.getType(defaultType);
    }

    /**
     * Gets the properties of the type.
     */
    getProperties(): Symbol[] {
        return this.compilerType.getProperties().map(s => this.context.compilerFactory.getSymbol(s));
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
        return this.compilerType.getApparentProperties().map(s => this.context.compilerFactory.getSymbol(s));
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
     * Gets if the type is possibly null or undefined.
     */
    isNullable() {
        return this.getUnionTypes().some(t => t.isNull() || t.isUndefined());
    }

    /**
     * Gets the non-nullable type.
     */
    getNonNullableType(): Type {
        return this.context.compilerFactory.getType(this.compilerType.getNonNullableType());
    }

    /**
     * Gets the number index type.
     */
    getNumberIndexType(): Type | undefined {
        const numberIndexType = this.compilerType.getNumberIndexType();
        return numberIndexType == null ? undefined : this.context.compilerFactory.getType(numberIndexType);
    }

    /**
     * Gets the string index type.
     */
    getStringIndexType(): Type | undefined {
        const stringIndexType = this.compilerType.getStringIndexType();
        return stringIndexType == null ? undefined : this.context.compilerFactory.getType(stringIndexType);
    }

    /**
     * Gets the target type of a type reference if it exists.
     */
    getTargetType(): Type<ts.GenericType> | undefined {
        const targetType = (this.compilerType as any as ts.TypeReference).target || undefined;
        return targetType == null ? undefined : this.context.compilerFactory.getType(targetType);
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
        return typeArguments.map(t => this.context.compilerFactory.getType(t));
    }

    /**
     * Gets the individual element types of the tuple.
     */
    getTupleElements(): Type[] {
        return this.isTuple() ? this.getTypeArguments() : [];
    }

    /**
     * Gets the union types.
     */
    getUnionTypes(): Type[] {
        if (!this.isUnion())
            return [];

        return (this.compilerType as any as ts.UnionType).types.map(t => this.context.compilerFactory.getType(t));
    }

    /**
     * Gets the intersection types.
     */
    getIntersectionTypes(): Type[] {
        if (!this.isIntersection())
            return [];

        return (this.compilerType as any as ts.IntersectionType).types.map(t => this.context.compilerFactory.getType(t));
    }

    /**
     * Gets the symbol of the type.
     */
    getSymbol(): Symbol | undefined {
        const tsSymbol = this.compilerType.getSymbol();
        return tsSymbol == null ? undefined : this.context.compilerFactory.getSymbol(tsSymbol);
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
    isAnonymous() {
        return this._hasObjectFlag(ObjectFlags.Anonymous);
    }

    /**
     * Gets if this is an array type.
     */
    isArray() {
        const symbol = this.getSymbol();
        if (symbol == null)
            return false;
        return symbol.getName() === "Array" && this.getTypeArguments().length === 1;
    }

    /**
     * Gets if this is a boolean type.
     */
    isBoolean() {
        return this._hasTypeFlag(TypeFlags.Boolean);
    }

    /**
     * Gets if this is a string type.
     */
    isString() {
        return this._hasTypeFlag(TypeFlags.String);
    }

    /**
     * Gets if this is a number type.
     */
    isNumber() {
        return this._hasTypeFlag(TypeFlags.Number);
    }

    /**
     * Gets if this is a literal type.
     */
    isLiteral() {
        // todo: remove this in TS 3.1 when https://github.com/Microsoft/TypeScript/issues/26075 is fixed
        const isBooleanLiteralForTs3_0 = this.isBooleanLiteral();
        return this.compilerType.isLiteral() || isBooleanLiteralForTs3_0;
    }

    /**
     * Gets if this is a boolean literal type.
     */
    isBooleanLiteral() {
        return this._hasTypeFlag(TypeFlags.BooleanLiteral);
    }

    /**
     * Gets if this is an enum literal type.
     */
    isEnumLiteral() {
        return this._hasTypeFlag(TypeFlags.EnumLiteral);
    }

    /**
     * Gets if this is a number literal type.
     */
    isNumberLiteral() {
        return this._hasTypeFlag(TypeFlags.NumberLiteral);
    }

    /**
     * Gets if this is a string literal type.
     */
    isStringLiteral() {
        return this.compilerType.isStringLiteral();
    }

    /**
     * Gets if this is a class type.
     */
    isClass() {
        return this.compilerType.isClass();
    }

    /**
     * Gets if this is a class or interface type.
     */
    isClassOrInterface() {
        return this.compilerType.isClassOrInterface();
    }

    /**
     * Gets if this is an enum type.
     */
    isEnum() {
        return this._hasTypeFlag(TypeFlags.Enum);
    }

    /**
     * Gets if this is an interface type.
     */
    isInterface() {
        return this._hasObjectFlag(ObjectFlags.Interface);
    }

    /**
     * Gets if this is an object type.
     */
    isObject() {
        return this._hasTypeFlag(TypeFlags.Object);
    }

    /**
     * Gets if this is a type parameter.
     */
    isTypeParameter(): this is TypeParameter {
        return this.compilerType.isTypeParameter();
    }

    /**
     * Gets if this is a tuple type.
     */
    isTuple() {
        const targetType = this.getTargetType();
        if (targetType == null)
            return false;
        return targetType._hasObjectFlag(ObjectFlags.Tuple);
    }

    /**
     * Gets if this is a union type.
     */
    isUnion() {
        return this.compilerType.isUnion();
    }

    /**
     * Gets if this is an intersection type.
     */
    isIntersection() {
        return this.compilerType.isIntersection();
    }

    /**
     * Gets if this is a union or intersection type.
     */
    isUnionOrIntersection() {
        return this.compilerType.isUnionOrIntersection();
    }

    /**
     * Gets if this is the null type.
     */
    isNull() {
        return this._hasTypeFlag(TypeFlags.Null);
    }

    /**
     * Gets if this is the undefined type.
     */
    isUndefined() {
        return this._hasTypeFlag(TypeFlags.Undefined);
    }

    /**
     * Gets the type flags.
     */
    getFlags(): TypeFlags {
        return this.compilerType.flags;
    }

    /**
     * Gets the object flags.
     * @remarks Returns 0 for a non-object type.
     */
    getObjectFlags() {
        if (!this.isObject())
            return 0;

        return (this.compilerType as any as ts.ObjectType).objectFlags || 0;
    }

    private _hasTypeFlag(flag: TypeFlags) {
        return (this.compilerType.flags & flag) === flag;
    }

    private _hasAnyTypeFlag(flag: TypeFlags) {
        return (this.compilerType.flags & flag) !== 0;
    }

    private _hasObjectFlag(flag: ObjectFlags) {
        return (this.getObjectFlags() & flag) === flag;
    }
}
