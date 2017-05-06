import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
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
     * @param typeChecker - Optional type checker.
     */
    getText(enclosingNode?: Node, typeFormatFlags?: ts.TypeFormatFlags, typeChecker: TypeChecker = this.factory.getTypeChecker()) {
        return typeChecker.getTypeText(this, enclosingNode, typeFormatFlags);
    }

    /**
     * Gets the apparent type.
     * @param typeChecker - Optional type checker.
     */
    getApparentType(typeChecker: TypeChecker = this.factory.getTypeChecker()) {
        return typeChecker.getApparentType(this);
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
     * Gets the apparent properties of the type.
     */
    getApparentProperties(): Symbol[] {
        return this.type.getApparentProperties().map(s => this.factory.getSymbol(s));
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
