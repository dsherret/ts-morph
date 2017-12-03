import * as ts from "typescript";
import * as errors from "./../../errors";
import {Constructor} from "./../../Constructor";
import {removeCommaSeparatedChild, verifyAndGetIndex, insertIntoCommaSeparatedNodes} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";

export type ArgumentedNodeExtensionType = Node<ts.Node & { arguments: ts.NodeArray<ts.Node>; }>;

export interface ArgumentedNode {
    /**
     * Gets all the arguments of the node.
     */
    getArguments(): Node[];
    /**
     * Adds an argument.
     * @param argumentText - Argument text to add.
     */
    addArgument(argumentText: string): Node;
    /**
     * Adds arguments.
     * @param argumentTexts - Argument texts to add.
     */
    addArguments(argumentTexts: string[]): Node[];
    /**
     * Inserts an argument.
     * @param index - Index to insert at.
     * @param argumentText - Argument text to insert.
     */
    insertArgument(index: number, argumentText: string): Node;
    /**
     * Inserts arguments.
     * @param index - Index to insert at.
     * @param argumentTexts - Argument texts to insert.
     */
    insertArguments(index: number, argumentTexts: string[]): Node[];
    /**
     * Removes an argument.
     * @param arg - Argument to remove.
     */
    removeArgument(arg: Node): this;
    /**
     * Removes an argument.
     * @param index - Index to remove.
     */
    removeArgument(index: number): this;
    /**
     * @internal
     */
    removeArgument(argOrIndex: Node | number): this;
}

export function ArgumentedNode<T extends Constructor<ArgumentedNodeExtensionType>>(Base: T): Constructor<ArgumentedNode> & T {
    return class extends Base implements ArgumentedNode {
        getArguments() {
            return this.compilerNode.arguments.map(a => this.global.compilerFactory.getNodeFromCompilerNode(a, this.sourceFile)) as Node[];
        }

        addArgument(argumentText: string) {
            return this.addArguments([argumentText])[0];
        }

        addArguments(argumentTexts: string[]) {
            return this.insertArguments(this.getArguments().length, argumentTexts);
        }

        insertArgument(index: number, argumentText: string) {
            return this.insertArguments(index, [argumentText])[0];
        }

        insertArguments(index: number, argumentTexts: string[]) {
            if (ArrayUtils.isNullOrEmpty(argumentTexts))
                return [];

            const args = this.getArguments();
            index = verifyAndGetIndex(index, args.length);

            insertIntoCommaSeparatedNodes({
                parent: this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenParenToken).getNextSiblingIfKindOrThrow(ts.SyntaxKind.SyntaxList),
                currentNodes: args,
                insertIndex: index,
                newTexts: argumentTexts
            });

            return this.getArguments().slice(index, index + argumentTexts.length);
        }

        removeArgument(arg: Node): this;
        removeArgument(index: number): this;
        removeArgument(argOrIndex: Node | number): this {
            const args = this.getArguments();
            if (args.length === 0)
                throw new errors.InvalidOperationError("Cannot remove an argument when none exist.");
            const argToRemove = typeof argOrIndex === "number" ? getArgFromIndex(argOrIndex) : argOrIndex;

            removeCommaSeparatedChild(argToRemove);

            return this;

            function getArgFromIndex(index: number) {
                return args[verifyAndGetIndex(index, args.length - 1)];
            }
        }
    };
}
