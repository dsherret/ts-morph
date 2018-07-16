import * as errors from "../../errors";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, removeCommaSeparatedChild, verifyAndGetIndex } from "../../manipulation";
import { Constructor, WriterFunction } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, printTextFromStringOrWriter } from "../../utils";
import { Node } from "../common";

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
    addArgument(argumentText: string | WriterFunction): Node;
    /**
     * Adds arguments.
     * @param argumentTexts - Argument texts to add.
     */
    addArguments(argumentTexts: (string | WriterFunction)[]): Node[];
    /**
     * Inserts an argument.
     * @param index - Child index to insert at.
     * @param argumentText - Argument text to insert.
     */
    insertArgument(index: number, argumentText: string | WriterFunction): Node;
    /**
     * Inserts arguments.
     * @param index - Child index to insert at.
     * @param argumentTexts - Argument texts to insert.
     */
    insertArguments(index: number, argumentTexts: (string | WriterFunction)[]): Node[];
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
            return this.compilerNode.arguments.map(a => this.getNodeFromCompilerNode(a));
        }

        addArgument(argumentText: string | WriterFunction) {
            return this.addArguments([argumentText])[0];
        }

        addArguments(argumentTexts: (string | WriterFunction)[]) {
            return this.insertArguments(this.getArguments().length, argumentTexts);
        }

        insertArgument(index: number, argumentText: string | WriterFunction) {
            return this.insertArguments(index, [argumentText])[0];
        }

        insertArguments(index: number, argumentTexts: (string | WriterFunction)[]) {
            if (ArrayUtils.isNullOrEmpty(argumentTexts))
                return [];

            const args = this.getArguments();
            index = verifyAndGetIndex(index, args.length);

            const writer = this.getWriterWithQueuedChildIndentation();
            for (let i = 0; i < argumentTexts.length; i++) {
                writer.conditionalWrite(i > 0, ", ");
                printTextFromStringOrWriter(writer, argumentTexts[i]);
            }

            insertIntoCommaSeparatedNodes({
                parent: this.getFirstChildByKindOrThrow(SyntaxKind.OpenParenToken).getNextSiblingIfKindOrThrow(SyntaxKind.SyntaxList),
                currentNodes: args,
                insertIndex: index,
                newText: writer.toString()
            });

            return getNodesToReturn(this.getArguments(), index, argumentTexts.length);
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
