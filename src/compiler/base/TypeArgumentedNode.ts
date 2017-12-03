import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {verifyAndGetIndex, removeChildren, removeCommaSeparatedChild, insertIntoParent, insertIntoCommaSeparatedNodes} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {TypeNode} from "./../type";

export type TypeArgumentedNodeExtensionType = Node<ts.Node & { typeArguments?: ts.NodeArray<ts.TypeNode>; }>;

export interface TypeArgumentedNode {
    /**
     * Gets all the type arguments of the node.
     */
    getTypeArguments(): TypeNode[];
    /**
     * Adds a type argument.
     * @param argumentText - Argument text to add.
     */
    addTypeArgument(argumentText: string): TypeNode;
    /**
     * Adds type arguments.
     * @param argumentTexts - Argument texts to add.
     */
    addTypeArguments(argumentTexts: string[]): TypeNode[];
    /**
     * Inserts a type argument.
     * @param index - Index to insert at.
     * @param argumentText - Argument text to insert.
     */
    insertTypeArgument(index: number, argumentText: string): TypeNode;
    /**
     * Inserts type arguments.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument texts to insert.
     */
    insertTypeArguments(index: number, argumentTexts: string[]): TypeNode[];
    /**
     * Removes a type argument.
     * @param typeArg - Type argument to remove.
     */
    removeTypeArgument(typeArg: Node): this;
    /**
     * Removes a type argument.
     * @param index - Index to remove.
     */
    removeTypeArgument(index: number): this;
    /**
     * Removes a type argument.
     * @internal
     * @param typeArgOrIndex - Type argument of index to remove.
     */
    removeTypeArgument(typeArgOrIndex: Node | number): this;
}

export function TypeArgumentedNode<T extends Constructor<TypeArgumentedNodeExtensionType>>(Base: T): Constructor<TypeArgumentedNode> & T {
    return class extends Base implements TypeArgumentedNode {
        getTypeArguments() {
            if (this.compilerNode.typeArguments == null)
                return [];
            return this.compilerNode.typeArguments.map(a => this.global.compilerFactory.getNodeFromCompilerNode(a, this.sourceFile) as TypeNode);
        }

        addTypeArgument(argumentText: string) {
            return this.addTypeArguments([argumentText])[0];
        }

        addTypeArguments(argumentTexts: string[]) {
            return this.insertTypeArguments(this.getTypeArguments().length, argumentTexts);
        }

        insertTypeArgument(index: number, argumentText: string) {
            return this.insertTypeArguments(index, [argumentText])[0];
        }

        insertTypeArguments(index: number, argumentTexts: string[]) {
            if (ArrayUtils.isNullOrEmpty(argumentTexts))
                return [];

            const typeArguments = this.getTypeArguments();
            index = verifyAndGetIndex(index, typeArguments.length);

            if (typeArguments.length === 0) {
                const identifier = this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier);
                insertIntoParent({
                    insertPos: identifier.getEnd(),
                    childIndex: identifier.getChildIndex() + 1,
                    insertItemsCount: 3, // FirstBinaryOperator, SyntaxList, GreaterThanToken
                    parent: this,
                    newText: `<${argumentTexts.join(", ")}>`
                });
            }
            else {
                insertIntoCommaSeparatedNodes({
                    parent: this.getFirstChildByKindOrThrow(ts.SyntaxKind.FirstBinaryOperator).getNextSiblingIfKindOrThrow(ts.SyntaxKind.SyntaxList),
                    currentNodes: typeArguments,
                    insertIndex: index,
                    newTexts: argumentTexts
                });
            }

            return this.getTypeArguments().slice(index, index + argumentTexts.length);
        }

        removeTypeArgument(typeArg: Node): this;
        removeTypeArgument(index: number): this;
        removeTypeArgument(typeArgOrIndex: Node | number) {
            const typeArguments = this.getTypeArguments();
            if (typeArguments.length === 0)
                throw new errors.InvalidOperationError("Cannot remove a type argument when none exist.");
            const typeArgToRemove = typeof typeArgOrIndex === "number" ? getTypeArgFromIndex(typeArgOrIndex) : typeArgOrIndex;

            if (typeArguments.length === 1) {
                const childSyntaxList = typeArguments[0].getParentSyntaxListOrThrow();
                removeChildren({
                    children: [
                        childSyntaxList.getPreviousSiblingIfKindOrThrow(ts.SyntaxKind.FirstBinaryOperator),
                        childSyntaxList,
                        childSyntaxList.getNextSiblingIfKindOrThrow(ts.SyntaxKind.GreaterThanToken)
                    ]
                });
            }
            else
                removeCommaSeparatedChild(typeArgToRemove);

            return this;

            function getTypeArgFromIndex(index: number) {
                return typeArguments[verifyAndGetIndex(index, typeArguments.length - 1)];
            }
        }
    };
}
