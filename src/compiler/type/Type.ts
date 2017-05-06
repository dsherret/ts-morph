import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {getSymbolByNameOrFindFunction} from "./../../utils";
import {Node} from "./../common/Node";
import {Symbol} from "./../common/Symbol";
import {Signature} from "./../common/Signature";
import {TypeChecker} from "./../tools";

export class Type<TType extends ts.Type = ts.Type> {
    /** @internal */
    protected readonly factory: CompilerFactory;
    // this only public because the typescript compiler has a bug that's demonstrated when making it protected
    // this should never be accessed outside the class
    // todo: see if a bug is logged in the compiler for this
    /** @internal */
    public readonly type: TType;

    /**
     * Initializes a new instance of Type.
     * @internal
     * @param factory - Compiler factory.
     * @param type - Compiler type.
     */
    constructor(factory: CompilerFactory, type: TType) {
        this.factory = factory;
        this.type = type;
    }

    /**
     * Gets the underlying compiler type.
     */
    getCompilerType() {
        return this.type;
    }

    /**
     * Gets the type text.
     * @param enclosingNode - The enclosing node.
     * @param typeFormatFlags - Format flags for the type text.
     */
    getText(enclosingNode?: Node, typeFormatFlags?: ts.TypeFormatFlags) {
        return this.factory.getTypeChecker().getTypeText(this, enclosingNode, typeFormatFlags);
    }

    /**
     * Gets the alias symbol if it exists.
     */
    getAliasSymbol(): Symbol | undefined {
        return this.type.aliasSymbol == null ? undefined : this.factory.getSymbol(this.type.aliasSymbol);
    }

    /**
     * Gets the alias type arguments.
     */
    getAliasTypeArguments(): Type[] {
        const aliasTypeArgs = this.type.aliasTypeArguments || [];
        return aliasTypeArgs.map(t => this.factory.getType(t));
    }

    /**
     * Gets the apparent type.
     */
    getApparentType() {
        return this.factory.getTypeChecker().getApparentType(this);
    }

    /**
     * Gets the base types.
     */
    getBaseTypes() {
        const baseTypes = this.type.getBaseTypes() || [];
        return baseTypes.map(t => this.factory.getType(t));
    }

    /**
     * Gets the call signatures.
     */
    getCallSignatures(): Signature[] {
        return this.type.getCallSignatures().map(s => this.factory.getSignature(s));
    }

    /**
     * Gets the construct signatures.
     */
    getConstructSignatures(): Signature[] {
        return this.type.getConstructSignatures().map(s => this.factory.getSignature(s));
    }

    /**
     * Gets the properties of the type.
     */
    getProperties(): Symbol[] {
        return this.type.getProperties().map(s => this.factory.getSymbol(s));
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
        return this.type.getApparentProperties().map(s => this.factory.getSymbol(s));
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
        return this.factory.getType(this.type.getNonNullableType());
    }

    /**
     * Gets the number index type.
     */
    getNumberIndexType(): Type | undefined {
        const numberIndexType = this.type.getNumberIndexType();
        return numberIndexType == null ? undefined : this.factory.getType(numberIndexType);
    }

    /**
     * Gets the string index type.
     */
    getStringIndexType(): Type | undefined {
        const stringIndexType = this.type.getStringIndexType();
        return stringIndexType == null ? undefined : this.factory.getType(stringIndexType);
    }

    /**
     * Gets the union types.
     */
    getUnionTypes(): Type[] {
        if (!this.isUnionType())
            return [];

        return this.type.types.map(t => this.factory.getType(t));
    }

    /**
     * Gets the intersection types.
     */
    getIntersectionTypes(): Type[] {
        if (!this.isIntersectionType())
            return [];

        return this.type.types.map(t => this.factory.getType(t));
    }

    /**
     * Gets the symbol of the type.
     */
    getSymbol(): Symbol | undefined {
        const tsSymbol = this.type.getSymbol();
        return tsSymbol == null ? undefined : this.factory.getSymbol(tsSymbol);
    }

    /**
     * Gets if this is an anonymous type.
     */
    isAnonymousType() {
        return (this.getObjectFlags() & ts.ObjectFlags.Anonymous) !== 0;
    }

    /**
     * Gets if this is a boolean type.
     */
    isBooleanType() {
        return (this.type.flags & ts.TypeFlags.Boolean) !== 0;
    }

    /**
     * Gets if this is an enum type.
     */
    isEnumType(): this is Type<ts.EnumType> {
        return (this.type.flags & ts.TypeFlags.Enum) !== 0;
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
        return (this.type.flags & ts.TypeFlags.Intersection) !== 0;
    }

    /**
     * Gets if this is an object type.
     */
    isObjectType(): this is Type<ts.ObjectType> {
        return (this.type.flags & ts.TypeFlags.Object) !== 0;
    }

    /**
     * Gets if this is a union type.
     */
    isUnionType(): this is Type<ts.UnionOrIntersectionType> {
        return (this.type.flags & ts.TypeFlags.Union) !== 0;
    }

    /**
     * Gets the type flags.
     */
    getFlags(): ts.TypeFlags {
        return this.type.flags;
    }

    /**
     * Gets the object flags.
     */
    getObjectFlags() {
        if (!this.isObjectType())
            return 0;

        return this.type.objectFlags || 0;
    }
}
