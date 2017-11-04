import * as ts from "typescript";
import * as errors from "./../../errors";
import {Constructor} from "./../../Constructor";
import {removeCommaSeparatedChild, verifyAndGetIndex} from "./../../manipulation";
import {Node} from "./../common";

export type ArgumentedNodeExtensionType = Node<ts.Node & { arguments: ts.NodeArray<ts.Node>; }>;

export interface ArgumentedNode {
    /**
     * Gets all the arguments of the node.
     */
    getArguments(): Node[];
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
     * Removes an argument argument.
     * @internal
     * @param argOrIndex - Argument of index to remove.
     */
    removeArgument(argOrIndex: Node | number): this;
}

export function ArgumentedNode<T extends Constructor<ArgumentedNodeExtensionType>>(Base: T): Constructor<ArgumentedNode> & T {
    return class extends Base implements ArgumentedNode {
        getArguments() {
            return this.compilerNode.arguments.map(a => this.global.compilerFactory.getNodeFromCompilerNode(a, this.sourceFile)) as Node[];
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
