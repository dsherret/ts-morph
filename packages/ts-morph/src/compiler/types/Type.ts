import { errors, ObjectFlags, ts, TypeFlags, TypeFormatFlags } from "@ts-morph/common";
import { ProjectContext } from "../../ProjectContext";
import { getNotFoundErrorMessageForNameOrFindFunction, getSymbolByNameOrFindFunction } from "../../utils";
import { Node } from "../ast";
import { Signature, Symbol } from "../symbols";
import { TypeParameter } from "./TypeParameter";

export class Type<TType extends ts.Type = ts.Type> {
  /** @internal */
  readonly _context: ProjectContext;
  /** @internal */
  readonly #compilerType: TType;

  /**
   * Gets the underlying compiler type.
   */
  get compilerType() {
    return this.#compilerType;
  }

  /**
   * Initializes a new instance of Type.
   * @private
   * @param context - Project context.
   * @param type - Compiler type.
   */
  constructor(context: ProjectContext, type: TType) {
    this._context = context;
    this.#compilerType = type;
  }

  /**
   * Gets the type text.
   * @param enclosingNode - The enclosing node.
   * @param typeFormatFlags - Format flags for the type text.
   */
  getText(enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags): string {
    return this._context.typeChecker.getTypeText(this, enclosingNode, typeFormatFlags);
  }

  /**
   * Gets the alias symbol if it exists.
   */
  getAliasSymbol(): Symbol | undefined {
    return this.compilerType.aliasSymbol == null ? undefined : this._context.compilerFactory.getSymbol(this.compilerType.aliasSymbol);
  }

  /**
   * Gets the alias symbol if it exists, or throws.
   */
  getAliasSymbolOrThrow(message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getAliasSymbol(), "Expected to find an alias symbol.");
  }

  /**
   * Gets the alias type arguments.
   */
  getAliasTypeArguments(): Type[] {
    const aliasTypeArgs = this.compilerType.aliasTypeArguments || [];
    return aliasTypeArgs.map(t => this._context.compilerFactory.getType(t));
  }

  /**
   * Gets the apparent type.
   */
  getApparentType(): Type {
    return this._context.typeChecker.getApparentType(this);
  }

  /**
   * Gets the array element type or throws if it doesn't exist (ex. for `T[]` it would be `T`).
   */
  getArrayElementTypeOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getArrayElementType(), message ?? "Expected to find an array element type.");
  }

  /**
   * Gets the array element type or returns undefined if it doesn't exist (ex. for `T[]` it would be `T`).
   */
  getArrayElementType() {
    if (!this.isArray())
      return undefined;
    return this.getTypeArguments()[0];
  }

  /**
   * Gets the base types.
   */
  getBaseTypes() {
    const baseTypes = this.compilerType.getBaseTypes() || [];
    return baseTypes.map(t => this._context.compilerFactory.getType(t));
  }

  /**
   * Gets the base type of a literal type.
   *
   * For example, for a number literal type it will return the number type.
   */
  getBaseTypeOfLiteralType() {
    return this._context.typeChecker.getBaseTypeOfLiteralType(this);
  }

  /**
   * Gets the call signatures.
   */
  getCallSignatures(): Signature[] {
    return this.compilerType.getCallSignatures().map(s => this._context.compilerFactory.getSignature(s));
  }

  /**
   * Gets the construct signatures.
   */
  getConstructSignatures(): Signature[] {
    return this.compilerType.getConstructSignatures().map(s => this._context.compilerFactory.getSignature(s));
  }

  /**
   * Gets the constraint or throws if it doesn't exist.
   */
  getConstraintOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getConstraint(), message ?? "Expected to find a constraint.");
  }

  /**
   * Gets the constraint or returns undefined if it doesn't exist.
   */
  getConstraint() {
    const constraint = this.compilerType.getConstraint();
    return constraint == null ? undefined : this._context.compilerFactory.getType(constraint);
  }

  /**
   * Gets the default type or throws if it doesn't exist.
   */
  getDefaultOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getDefault(), message ?? "Expected to find a default type.");
  }

  /**
   * Gets the default type or returns undefined if it doesn't exist.
   */
  getDefault() {
    const defaultType = this.compilerType.getDefault();
    return defaultType == null ? undefined : this._context.compilerFactory.getType(defaultType);
  }

  /**
   * Gets the properties of the type.
   */
  getProperties(): Symbol[] {
    return this.compilerType.getProperties().map(s => this._context.compilerFactory.getSymbol(s));
  }

  /**
   * Gets a property or throws if it doesn't exist.
   * @param name - By a name.
   */
  getPropertyOrThrow(name: string): Symbol;
  /**
   * Gets a property or throws if it doesn't exist.
   * @param findFunction - Function for searching for a property.
   */
  getPropertyOrThrow(findFunction: (declaration: Symbol) => boolean): Symbol;
  /** @internal */
  getPropertyOrThrow(nameOrFindFunction: string | ((declaration: Symbol) => boolean)): Symbol;
  getPropertyOrThrow(nameOrFindFunction: string | ((declaration: Symbol) => boolean)): Symbol {
    return errors.throwIfNullOrUndefined(
      this.getProperty(nameOrFindFunction),
      () => getNotFoundErrorMessageForNameOrFindFunction("symbol property", nameOrFindFunction),
    );
  }

  /**
   * Gets a property or returns undefined if it does not exist.
   * @param name - By a name.
   */
  getProperty(name: string): Symbol | undefined;
  /**
   * Gets a property or returns undefined if it does not exist.
   * @param findFunction - Function for searching for a property.
   */
  getProperty(findFunction: (declaration: Symbol) => boolean): Symbol | undefined;
  /** @internal */
  getProperty(nameOrFindFunction: string | ((declaration: Symbol) => boolean)): Symbol | undefined;
  getProperty(nameOrFindFunction: string | ((declaration: Symbol) => boolean)): Symbol | undefined {
    return getSymbolByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
  }

  /**
   * Gets the apparent properties of the type.
   */
  getApparentProperties(): Symbol[] {
    return this.compilerType.getApparentProperties().map(s => this._context.compilerFactory.getSymbol(s));
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
    return this._context.compilerFactory.getType(this.compilerType.getNonNullableType());
  }

  /**
   * Gets the number index type.
   */
  getNumberIndexType(): Type | undefined {
    const numberIndexType = this.compilerType.getNumberIndexType();
    return numberIndexType == null ? undefined : this._context.compilerFactory.getType(numberIndexType);
  }

  /**
   * Gets the string index type.
   */
  getStringIndexType(): Type | undefined {
    const stringIndexType = this.compilerType.getStringIndexType();
    return stringIndexType == null ? undefined : this._context.compilerFactory.getType(stringIndexType);
  }

  /**
   * Returns the generic type when the type is a type reference, returns itself when it's
   * already a generic type, or otherwise returns undefined.
   *
   * For example:
   *
   * - Given type reference `Promise<string>` returns `Promise<T>`.
   * - Given generic type `Promise<T>` returns the same `Promise<T>`.
   * - Given `string` returns `undefined`.
   */
  getTargetType(): Type<ts.GenericType> | undefined {
    const targetType = (this.compilerType as any as ts.TypeReference).target || undefined;
    return targetType == null ? undefined : this._context.compilerFactory.getType(targetType);
  }

  /**
   * Returns the generic type when the type is a type reference, returns itself when it's
   * already a generic type, or otherwise throws an error.
   *
   * For example:
   *
   * - Given type reference `Promise<string>` returns `Promise<T>`.
   * - Given generic type `Promise<T>` returns the same `Promise<T>`.
   * - Given `string` throws an error.
   */

  getTargetTypeOrThrow(message?: string | (() => string)): Type<ts.GenericType> {
    return errors.throwIfNullOrUndefined(this.getTargetType(), message ?? "Expected to find the target type.");
  }

  /**
   * Gets type arguments.
   */
  getTypeArguments(): Type[] {
    return this._context.typeChecker.getTypeArguments(this);
  }

  /**
   * Gets the individual element types of the tuple.
   */
  getTupleElements(): Type[] {
    return this.isTuple() ? this.getTypeArguments() : [];
  }

  /**
   * Gets the union types (ex. for `T | U` it returns the array `[T, U]`).
   */
  getUnionTypes(): Type[] {
    if (!this.isUnion())
      return [];

    return this.compilerType.types.map(t => this._context.compilerFactory.getType(t));
  }

  /**
   * Gets the intersection types (ex. for `T & U` it returns the array `[T, U]`).
   */
  getIntersectionTypes(): Type[] {
    if (!this.isIntersection())
      return [];

    return (this.compilerType as any as ts.IntersectionType).types.map(t => this._context.compilerFactory.getType(t));
  }

  /**
   * Gets the value of a literal or returns undefined if this is not a literal type.
   */
  getLiteralValue() {
    return (this.compilerType as any as ts.LiteralType | undefined)?.value;
  }

  /**
   * Gets the value of the literal or throws if this is not a literal type.
   */
  getLiteralValueOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getLiteralValue(), message ?? "Type was not a literal type.");
  }

  /**
   * Gets the fresh type of the literal or returns undefined if this is not a literal type.
   *
   * Note: I have no idea what this means. Please help contribute to these js docs if you know.
   */
  getLiteralFreshType() {
    const type = (this.compilerType as any as ts.LiteralType | undefined)?.freshType;
    return type == null ? undefined : this._context.compilerFactory.getType(type);
  }

  /**
   * Gets the fresh type of the literal or throws if this is not a literal type.
   *
   * Note: I have no idea what this means. Please help contribute to these js docs if you know.
   */
  getLiteralFreshTypeOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getLiteralFreshType(), message ?? "Type was not a literal type.");
  }

  /**
   * Gets the regular type of the literal or returns undefined if this is not a literal type.
   *
   * Note: I have no idea what this means. Please help contribute to these js docs if you know.
   */
  getLiteralRegularType() {
    const type = (this.compilerType as any as ts.LiteralType | undefined)?.regularType;
    return type == null ? undefined : this._context.compilerFactory.getType(type);
  }

  /**
   * Gets the regular type of the literal or throws if this is not a literal type.
   *
   * Note: I have no idea what this means. Please help contribute to these js docs if you know.
   */
  getLiteralRegularTypeOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getLiteralRegularType(), message ?? "Type was not a literal type.");
  }

  /**
   * Gets the symbol of the type.
   */
  getSymbol(): Symbol | undefined {
    const tsSymbol = this.compilerType.getSymbol();
    return tsSymbol == null ? undefined : this._context.compilerFactory.getSymbol(tsSymbol);
  }

  /**
   * Gets the symbol of the type or throws.
   */
  getSymbolOrThrow(message?: string | (() => string)): Symbol {
    return errors.throwIfNullOrUndefined(this.getSymbol(), message ?? "Expected to find a symbol.");
  }

  /**
   * Gets if this is an anonymous type.
   */
  isAnonymous() {
    return this.#hasObjectFlag(ObjectFlags.Anonymous);
  }

  /**
   * Gets if this is an any type.
   */
  isAny() {
    return this.#hasTypeFlag(TypeFlags.Any);
  }

  /**
   * Gets if this is a never type.
   */
  isNever() {
    return this.#hasTypeFlag(TypeFlags.Never);
  }

  /**
   * Gets if this is an array type.
   */
  isArray() {
    const symbol = this.getSymbol();
    if (symbol == null)
      return false;
    // this is not bulletproof and should be improved
    return (symbol.getName() === "Array" || symbol.getName() === "ReadonlyArray") && this.getTypeArguments().length === 1;
  }

  /**
   * Gets if this is a readonly array type.
   */
  isReadonlyArray() {
    const symbol = this.getSymbol();
    if (symbol == null)
      return false;
    // this is not bulletproof and should be improved
    return symbol.getName() === "ReadonlyArray" && this.getTypeArguments().length === 1;
  }

  /**
   * Gets if this is a template literal type.
   */
  isTemplateLiteral(): this is Type<ts.TemplateLiteralType> {
    return this.#hasTypeFlag(TypeFlags.TemplateLiteral);
  }

  /**
   * Gets if this is a boolean type.
   */
  isBoolean() {
    return this.#hasTypeFlag(TypeFlags.Boolean);
  }

  /**
   * Gets if this is a string type.
   */
  isString() {
    return this.#hasTypeFlag(TypeFlags.String);
  }

  /**
   * Gets if this is a number type.
   */
  isNumber() {
    return this.#hasTypeFlag(TypeFlags.Number);
  }

  /**
   * Gets if this is a literal type.
   */
  isLiteral() {
    // todo: remove this when https://github.com/Microsoft/TypeScript/issues/26075 is fixed
    const isBooleanLiteralForTs3_0 = this.isBooleanLiteral();
    return this.compilerType.isLiteral() || isBooleanLiteralForTs3_0;
  }

  /**
   * Gets if this is a boolean literal type.
   */
  isBooleanLiteral() {
    return this.#hasTypeFlag(TypeFlags.BooleanLiteral);
  }

  /**
   * Gets if this is an enum literal type.
   */
  isEnumLiteral() {
    return this.#hasTypeFlag(TypeFlags.EnumLiteral) && !this.isUnion();
  }

  /**
   * Gets if this is a number literal type.
   */
  isNumberLiteral(): this is Type<ts.NumberLiteralType> {
    return this.#hasTypeFlag(TypeFlags.NumberLiteral);
  }

  /**
   * Gets if this is a string literal type.
   */
  isStringLiteral(): this is Type<ts.StringLiteralType> {
    return this.compilerType.isStringLiteral();
  }

  /**
   * Gets if this is a class type.
   */
  isClass(): this is Type<ts.InterfaceType> {
    return this.compilerType.isClass();
  }

  /**
   * Gets if this is a class or interface type.
   */
  isClassOrInterface(): this is Type<ts.InterfaceType> {
    return this.compilerType.isClassOrInterface();
  }

  /**
   * Gets if this is an enum type.
   */
  isEnum() {
    const hasEnumFlag = this.#hasTypeFlag(TypeFlags.Enum);
    if (hasEnumFlag)
      return true;

    if (this.isEnumLiteral() && !this.isUnion())
      return false;

    const symbol = this.getSymbol();
    if (symbol == null)
      return false;

    const valueDeclaration = symbol.getValueDeclaration();
    return valueDeclaration != null && Node.isEnumDeclaration(valueDeclaration);
  }

  /**
   * Gets if this is an interface type.
   */
  isInterface(): this is Type<ts.InterfaceType> {
    return this.#hasObjectFlag(ObjectFlags.Interface);
  }

  /**
   * Gets if this is an object type.
   */
  isObject(): this is Type<ts.ObjectType> {
    return this.#hasTypeFlag(TypeFlags.Object);
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
  isTuple(): this is Type<ts.TupleType> {
    const targetType = this.getTargetType();
    if (targetType == null)
      return false;
    return targetType.#hasObjectFlag(ObjectFlags.Tuple);
  }

  /**
   * Gets if this is a union type.
   */
  isUnion(): this is Type<ts.UnionType> {
    return this.compilerType.isUnion();
  }

  /**
   * Gets if this is an intersection type.
   */
  isIntersection(): this is Type<ts.IntersectionType> {
    return this.compilerType.isIntersection();
  }

  /**
   * Gets if this is a union or intersection type.
   */
  isUnionOrIntersection(): this is Type<ts.UnionOrIntersectionType> {
    return this.compilerType.isUnionOrIntersection();
  }

  /**
   * Gets if this is the unknown type.
   */
  isUnknown() {
    return this.#hasTypeFlag(TypeFlags.Unknown);
  }

  /**
   * Gets if this is the null type.
   */
  isNull() {
    return this.#hasTypeFlag(TypeFlags.Null);
  }

  /**
   * Gets if this is the undefined type.
   */
  isUndefined() {
    return this.#hasTypeFlag(TypeFlags.Undefined);
  }

  /**
   * Gets if this is the void type.
   */
  isVoid() {
    return this.#hasTypeFlag(TypeFlags.Void);
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

  /** @internal */
  #hasTypeFlag(flag: TypeFlags) {
    return (this.compilerType.flags & flag) === flag;
  }

  /** @internal */
  #hasObjectFlag(flag: ObjectFlags) {
    return (this.getObjectFlags() & flag) === flag;
  }
}
