import * as errors from "../../../../errors";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex } from "../../../../manipulation";
import { CommaNewLineSeparatedStructuresPrinter, Printer } from "../../../../structurePrinters";
import { GetAccessorDeclarationStructure, MethodDeclarationStructure, PropertyAssignmentStructure, SetAccessorDeclarationStructure,
    ShorthandPropertyAssignmentStructure, SpreadAssignmentStructure, OptionalKind } from "../../../../structures";
import { SyntaxKind, ts } from "../../../../typescript";
import { ArrayUtils, getNotFoundErrorMessageForNameOrFindFunction } from "../../../../utils";
import { ObjectLiteralElementLike } from "../../aliases";
import { GetAccessorDeclaration, MethodDeclaration, SetAccessorDeclaration } from "../../class";
import { PrimaryExpression } from "../PrimaryExpression";
import { CommentObjectLiteralElement } from "./CommentObjectLiteralElement";
import { PropertyAssignment } from "./PropertyAssignment";
import { ShorthandPropertyAssignment } from "./ShorthandPropertyAssignment";
import { SpreadAssignment } from "./SpreadAssignment";
import { ExtendedParser } from "../../utils";

export const ObjectLiteralExpressionBase = PrimaryExpression;
export class ObjectLiteralExpression extends ObjectLiteralExpressionBase<ts.ObjectLiteralExpression> {
    /**
     * Gets the first property by the provided name or throws.
     * @param name - Name of the property.
     */
    getPropertyOrThrow(name: string): ObjectLiteralElementLike;
    /**
     * Gets the first property that matches the provided find function or throws.
     * @param findFunction - Find function.
     */
    getPropertyOrThrow(findFunction: (property: ObjectLiteralElementLike) => boolean): ObjectLiteralElementLike;
    getPropertyOrThrow(nameOrFindFunction: string | ((property: ObjectLiteralElementLike) => boolean)): ObjectLiteralElementLike {
        return errors.throwIfNullOrUndefined(this.getProperty(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("property", nameOrFindFunction));
    }

    /**
     * Gets the first property by the provided name or returns undefined.
     * @param name - Name of the property.
     */
    getProperty(name: string): ObjectLiteralElementLike | undefined;
    /**
     * Gets the first property that matches the provided find function or returns undefined.
     * @param findFunction - Find function.
     */
    getProperty(findFunction: (property: ObjectLiteralElementLike) => boolean): ObjectLiteralElementLike | undefined;
    /** @internal */
    getProperty(nameOrFindFunction: string | ((property: ObjectLiteralElementLike) => boolean)): ObjectLiteralElementLike | undefined;
    getProperty(nameOrFindFunction: string | ((property: ObjectLiteralElementLike) => boolean)): ObjectLiteralElementLike | undefined {
        let findFunc: (property: ObjectLiteralElementLike) => boolean;
        if (typeof nameOrFindFunction === "string")
            findFunc = prop => {
                if ((prop as any)[nameof<PropertyAssignment>(o => o.getName)] == null)
                    return false;
                return (prop as PropertyAssignment).getName() === nameOrFindFunction;
            };
        else
            findFunc = nameOrFindFunction;

        return this.getProperties().find(findFunc);
    }

    /**
     * Gets the properties.
     */
    getProperties() {
        return this.compilerNode.properties.map(p => this._getNodeFromCompilerNode(p)) as ObjectLiteralElementLike[];
    }

    /**
     * Gets the properties with comment object literal elements.
     */
    getPropertiesWithComments(): (ObjectLiteralElementLike | CommentObjectLiteralElement)[] {
        const members = ExtendedParser.getContainerArray(this.compilerNode, this.getSourceFile().compilerNode);
        return members.map(p => this._getNodeFromCompilerNode(p)) as (ObjectLiteralElementLike | CommentObjectLiteralElement)[];
    }

    /** @internal */
    private _getAddIndex() {
        const members = ExtendedParser.getContainerArray(this.compilerNode, this.getSourceFile().compilerNode);
        return members.length;
    }

    /* Property Assignments */

    /**
     * Adds a property assignment.
     * @param structure - Structure that represents the property assignment to add.
     */
    addPropertyAssignment(structure: OptionalKind<PropertyAssignmentStructure>) {
        return this.addPropertyAssignments([structure])[0];
    }

    /**
     * Adds property assignments.
     * @param structures - Structure that represents the property assignments to add.
     */
    addPropertyAssignments(structures: ReadonlyArray<OptionalKind<PropertyAssignmentStructure>>) {
        return this.insertPropertyAssignments(this._getAddIndex(), structures);
    }

    /**
     * Inserts a property assignment at the specified index.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the property assignment to insert.
     */
    insertPropertyAssignment(index: number, structure: OptionalKind<PropertyAssignmentStructure>) {
        return this.insertPropertyAssignments(index, [structure])[0];
    }

    /**
     * Inserts property assignments at the specified index.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the property assignments to insert.
     */
    insertPropertyAssignments(index: number, structures: ReadonlyArray<OptionalKind<PropertyAssignmentStructure>>) {
        return this._insertProperty(index, structures, () => this._context.structurePrinterFactory.forPropertyAssignment()) as PropertyAssignment[];
    }

    /* Shorthand Property Assignments */

    /**
     * Adds a shorthand property assignment.
     * @param structure - Structure that represents the shorthand property assignment to add.
     */
    addShorthandPropertyAssignment(structure: OptionalKind<ShorthandPropertyAssignmentStructure>) {
        return this.addShorthandPropertyAssignments([structure])[0];
    }

    /**
     * Adds shorthand property assignments.
     * @param structures - Structure that represents the shorthand property assignments to add.
     */
    addShorthandPropertyAssignments(structures: ReadonlyArray<OptionalKind<ShorthandPropertyAssignmentStructure>>) {
        return this.insertShorthandPropertyAssignments(this._getAddIndex(), structures);
    }

    /**
     * Inserts a shorthand property assignment at the specified index.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the shorthand property assignment to insert.
     */
    insertShorthandPropertyAssignment(index: number, structure: OptionalKind<ShorthandPropertyAssignmentStructure>) {
        return this.insertShorthandPropertyAssignments(index, [structure])[0];
    }

    /**
     * Inserts shorthand property assignments at the specified index.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the shorthand property assignments to insert.
     */
    insertShorthandPropertyAssignments(index: number, structures: ReadonlyArray<OptionalKind<ShorthandPropertyAssignmentStructure>>) {
        return this._insertProperty(index, structures, () => this._context.structurePrinterFactory.forShorthandPropertyAssignment()) as ShorthandPropertyAssignment[];
    }

    /* Spread Assignments */

    /**
     * Adds a spread assignment.
     * @param structure - Structure that represents the spread assignment to add.
     */
    addSpreadAssignment(structure: OptionalKind<SpreadAssignmentStructure>) {
        return this.addSpreadAssignments([structure])[0];
    }

    /**
     * Adds spread assignments.
     * @param structures - Structure that represents the spread assignments to add.
     */
    addSpreadAssignments(structures: ReadonlyArray<OptionalKind<SpreadAssignmentStructure>>) {
        return this.insertSpreadAssignments(this._getAddIndex(), structures);
    }

    /**
     * Inserts a spread assignment at the specified index.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the spread assignment to insert.
     */
    insertSpreadAssignment(index: number, structure: OptionalKind<SpreadAssignmentStructure>) {
        return this.insertSpreadAssignments(index, [structure])[0];
    }

    /**
     * Inserts spread assignments at the specified index.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the spread assignments to insert.
     */
    insertSpreadAssignments(index: number, structures: ReadonlyArray<OptionalKind<SpreadAssignmentStructure>>) {
        return this._insertProperty(index, structures, () => this._context.structurePrinterFactory.forSpreadAssignment()) as SpreadAssignment[];
    }

    /* Method Declarations */

    /**
     * Adds a method.
     * @param structure - Structure that represents the method to add.
     */
    addMethod(structure: OptionalKind<MethodDeclarationStructure>) {
        return this.addMethods([structure])[0];
    }

    /**
     * Adds methods.
     * @param structures - Structure that represents the methods to add.
     */
    addMethods(structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>) {
        return this.insertMethods(this._getAddIndex(), structures);
    }

    /**
     * Inserts a method at the specified index.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the method to insert.
     */
    insertMethod(index: number, structure: OptionalKind<MethodDeclarationStructure>) {
        return this.insertMethods(index, [structure])[0];
    }

    /**
     * Inserts methods at the specified index.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the methods to insert.
     */
    insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>) {
        return this._insertProperty(index, structures, () => this._context.structurePrinterFactory.forMethodDeclaration({ isAmbient: false })) as MethodDeclaration[];
    }

    /* Get Accessor Declarations */

    /**
     * Adds a get accessor.
     * @param structure - Structure that represents the property assignment to add.
     */
    addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>) {
        return this.addGetAccessors([structure])[0];
    }

    /**
     * Adds get accessors.
     * @param structures - Structure that represents the get accessors to add.
     */
    addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>) {
        return this.insertGetAccessors(this._getAddIndex(), structures);
    }

    /**
     * Inserts a get accessor at the specified index.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the get accessor to insert.
     */
    insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>) {
        return this.insertGetAccessors(index, [structure])[0];
    }

    /**
     * Inserts get accessors at the specified index.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the get accessors to insert.
     */
    insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>) {
        return this._insertProperty(index, structures, () => this._context.structurePrinterFactory.forGetAccessorDeclaration({ isAmbient: false })) as GetAccessorDeclaration[];
    }

    /* Set Accessor Declarations */

    /**
     * Adds a set accessor.
     * @param structure - Structure that represents the property assignment to add.
     */
    addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>) {
        return this.addSetAccessors([structure])[0];
    }

    /**
     * Adds set accessors.
     * @param structures - Structure that represents the set accessors to add.
     */
    addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>) {
        return this.insertSetAccessors(this._getAddIndex(), structures);
    }

    /**
     * Inserts a set accessor at the specified index.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the set accessor to insert.
     */
    insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>) {
        return this.insertSetAccessors(index, [structure])[0];
    }

    /**
     * Inserts set accessors at the specified index.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the set accessors to insert.
     */
    insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>) {
        return this._insertProperty(index, structures, () => this._context.structurePrinterFactory.forSetAccessorDeclaration({ isAmbient: false })) as SetAccessorDeclaration[];
    }

    /**
     * @internal
     */
    private _insertProperty<T>(index: number, structures: ReadonlyArray<T>, createStructurePrinter: () => Printer<T>) {
        index = verifyAndGetIndex(index, this._getAddIndex());
        const writer = this._getWriterWithChildIndentation();
        const structurePrinter = new CommaNewLineSeparatedStructuresPrinter(createStructurePrinter());

        structurePrinter.printText(writer, structures);

        insertIntoCommaSeparatedNodes({
            parent: this.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
            currentNodes: this.getProperties(),
            insertIndex: index,
            newText: writer.toString(),
            useNewLines: true
        });

        return getNodesToReturn(this.getProperties(), index, structures.length);
    }
}
