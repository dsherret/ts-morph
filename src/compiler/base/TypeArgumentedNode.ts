import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {verifyAndGetIndex, removeChildren, removeCommaSeparatedChild} from "./../../manipulation";
import {Node} from "./../common";
import {TypeNode} from "./../type";

export type TypeArgumentedNodeExtensionType = Node<ts.Node & { typeArguments?: ts.NodeArray<ts.TypeNode>; }>;

export interface TypeArgumentedNode {
    /**
     * Gets all the type arguments of the node.
     */
    getTypeArguments(): TypeNode[];
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
