import * as ts from "typescript";
import CodeBlockWriter from "code-block-writer";
import * as errors from "./../../../errors";
import {ArrayUtils} from "./../../../utils";
import {verifyAndGetIndex, insertIntoCommaSeparatedNodes} from "./../../../manipulation";
import {StructureToText, PropertyAssignmentStructureToText, ShorthandPropertyAssignmentStructureToText, SpreadAssignmentStructureToText,
    MethodDeclarationStructureToText, GetAccessorDeclarationStructureToText, SetAccessorDeclarationStructureToText} from "./../../../structuresToText";
import {PropertyAssignmentStructure, ShorthandPropertyAssignmentStructure, SpreadAssignmentStructure,
    MethodDeclarationStructure, GetAccessorDeclarationStructure, SetAccessorDeclarationStructure} from "./../../../structures";
import {ObjectLiteralElementLike} from "./../../aliases";
import {MethodDeclaration, GetAccessorDeclaration, SetAccessorDeclaration} from "./../../class";
import {Expression} from "./../Expression";
import {Node} from "./../Node";
import {PropertyAssignment} from "./PropertyAssignment";
import {ShorthandPropertyAssignment} from "./ShorthandPropertyAssignment";
import {SpreadAssignment} from "./SpreadAssignment";

export class ObjectLiteralExpression extends Expression<ts.ObjectLiteralExpression> {
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
        return errors.throwIfNullOrUndefined(this.getProperty(nameOrFindFunction), "Expected to find a property.");
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

        return ArrayUtils.find(this.getProperties(), findFunc);
    }

    /**
     * Gets the properties.
     */
    getProperties(): ObjectLiteralElementLike[] {
        const properties: ts.NodeArray<ts.ObjectLiteralElementLike> = this.compilerNode.properties; // explicit type for validation
        return properties.map(p => this.global.compilerFactory.getNodeFromCompilerNode(p, this.sourceFile)) as ObjectLiteralElementLike[];
    }

    /* Property Assignments */

    /**
     * Adds a property assignment.
     * @param structure - Structure that represents the property assignment to add.
     */
    addPropertyAssignment(structure: PropertyAssignmentStructure) {
        return this.addPropertyAssignments([structure])[0];
    }

    /**
     * Adds property assignments.
     * @param structures - Structure that represents the property assignments to add.
     */
    addPropertyAssignments(structures: PropertyAssignmentStructure[]) {
        return this.insertPropertyAssignments(this.compilerNode.properties.length, structures);
    }

    /**
     * Inserts a property assignment at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the property assignment to insert.
     */
    insertPropertyAssignment(index: number, structure: PropertyAssignmentStructure) {
        return this.insertPropertyAssignments(index, [structure])[0];
    }

    /**
     * Inserts property assignments at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the property assignments to insert.
     */
    insertPropertyAssignments(index: number, structures: PropertyAssignmentStructure[]) {
        return this._insertProperty(index, structures, writer => new PropertyAssignmentStructureToText(writer)) as PropertyAssignment[];
    }

    /* Shorthand Property Assignments */

    /**
     * Adds a shorthand property assignment.
     * @param structure - Structure that represents the shorthand property assignment to add.
     */
    addShorthandPropertyAssignment(structure: ShorthandPropertyAssignmentStructure) {
        return this.addShorthandPropertyAssignments([structure])[0];
    }

    /**
     * Adds shorthand property assignments.
     * @param structures - Structure that represents the shorthand property assignments to add.
     */
    addShorthandPropertyAssignments(structures: ShorthandPropertyAssignmentStructure[]) {
        return this.insertShorthandPropertyAssignments(this.compilerNode.properties.length, structures);
    }

    /**
     * Inserts a shorthand property assignment at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the shorthand property assignment to insert.
     */
    insertShorthandPropertyAssignment(index: number, structure: ShorthandPropertyAssignmentStructure) {
        return this.insertShorthandPropertyAssignments(index, [structure])[0];
    }

    /**
     * Inserts shorthand property assignments at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the shorthand property assignments to insert.
     */
    insertShorthandPropertyAssignments(index: number, structures: ShorthandPropertyAssignmentStructure[]) {
        return this._insertProperty(index, structures, writer => new ShorthandPropertyAssignmentStructureToText(writer)) as ShorthandPropertyAssignment[];
    }

    /* Spread Assignments */

    /**
     * Adds a spread assignment.
     * @param structure - Structure that represents the spread assignment to add.
     */
    addSpreadAssignment(structure: SpreadAssignmentStructure) {
        return this.addSpreadAssignments([structure])[0];
    }

    /**
     * Adds spread assignments.
     * @param structures - Structure that represents the spread assignments to add.
     */
    addSpreadAssignments(structures: SpreadAssignmentStructure[]) {
        return this.insertSpreadAssignments(this.compilerNode.properties.length, structures);
    }

    /**
     * Inserts a spread assignment at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the spread assignment to insert.
     */
    insertSpreadAssignment(index: number, structure: SpreadAssignmentStructure) {
        return this.insertSpreadAssignments(index, [structure])[0];
    }

    /**
     * Inserts spread assignments at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the spread assignments to insert.
     */
    insertSpreadAssignments(index: number, structures: SpreadAssignmentStructure[]) {
        return this._insertProperty(index, structures, writer => new SpreadAssignmentStructureToText(writer)) as SpreadAssignment[];
    }

    /* Method Declarations */

    /**
     * Adds a method.
     * @param structure - Structure that represents the method to add.
     */
    addMethod(structure: MethodDeclarationStructure) {
        return this.addMethods([structure])[0];
    }

    /**
     * Adds methods.
     * @param structures - Structure that represents the methods to add.
     */
    addMethods(structures: MethodDeclarationStructure[]) {
        return this.insertMethods(this.compilerNode.properties.length, structures);
    }

    /**
     * Inserts a method at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the method to insert.
     */
    insertMethod(index: number, structure: MethodDeclarationStructure) {
        return this.insertMethods(index, [structure])[0];
    }

    /**
     * Inserts methods at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the methods to insert.
     */
    insertMethods(index: number, structures: MethodDeclarationStructure[]) {
        return this._insertProperty(index, structures, writer => new MethodDeclarationStructureToText(writer, { isAmbient: false })) as MethodDeclaration[];
    }

    /* Get Accessor Declarations */

    /**
     * Adds a get accessor.
     * @param structure - Structure that represents the property assignment to add.
     */
    addGetAccessor(structure: GetAccessorDeclarationStructure) {
        return this.addGetAccessors([structure])[0];
    }

    /**
     * Adds get accessors.
     * @param structures - Structure that represents the get accessors to add.
     */
    addGetAccessors(structures: GetAccessorDeclarationStructure[]) {
        return this.insertGetAccessors(this.compilerNode.properties.length, structures);
    }

    /**
     * Inserts a get accessor at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the get accessor to insert.
     */
    insertGetAccessor(index: number, structure: GetAccessorDeclarationStructure) {
        return this.insertGetAccessors(index, [structure])[0];
    }

    /**
     * Inserts get accessors at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the get accessors to insert.
     */
    insertGetAccessors(index: number, structures: GetAccessorDeclarationStructure[]) {
        return this._insertProperty(index, structures, writer => new GetAccessorDeclarationStructureToText(writer)) as GetAccessorDeclaration[];
    }

    /* Set Accessor Declarations */

    /**
     * Adds a set accessor.
     * @param structure - Structure that represents the property assignment to add.
     */
    addSetAccessor(structure: SetAccessorDeclarationStructure) {
        return this.addSetAccessors([structure])[0];
    }

    /**
     * Adds set accessors.
     * @param structures - Structure that represents the set accessors to add.
     */
    addSetAccessors(structures: SetAccessorDeclarationStructure[]) {
        return this.insertSetAccessors(this.compilerNode.properties.length, structures);
    }

    /**
     * Inserts a set accessor at the specified index.
     * @param index - Index to insert.
     * @param structure - Structure that represents the set accessor to insert.
     */
    insertSetAccessor(index: number, structure: SetAccessorDeclarationStructure) {
        return this.insertSetAccessors(index, [structure])[0];
    }

    /**
     * Inserts set accessors at the specified index.
     * @param index - Index to insert.
     * @param structures - Structures that represent the set accessors to insert.
     */
    insertSetAccessors(index: number, structures: SetAccessorDeclarationStructure[]) {
        return this._insertProperty(index, structures, writer => new SetAccessorDeclarationStructureToText(writer)) as SetAccessorDeclaration[];
    }

    /**
     * @internal
     */
    private _insertProperty<T>(index: number, structures: T[], createStructureToText: (writer: CodeBlockWriter) => StructureToText<T>) {
        index = verifyAndGetIndex(index, this.compilerNode.properties.length);
        const newTexts = structures.map(s => {
            // todo: pass in the StructureToText to the function below
            const writer = this.getChildWriter();
            const structureToText = createStructureToText(writer);
            structureToText.writeText(s);
            return writer.toString();
        });

        insertIntoCommaSeparatedNodes({
            parent: this.getFirstChildByKindOrThrow(ts.SyntaxKind.SyntaxList),
            currentNodes: this.getProperties(),
            insertIndex: index,
            newTexts,
            useNewlines: true
        });

        return this.getProperties().slice(index, index + structures.length);
    }
}
