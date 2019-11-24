import { Node } from "../../compiler";
import { errors, ts } from "@ts-morph/common";
import { NodeHandler } from "./NodeHandler";

/**
 * Attempts to use a node handler, but if it fails it will forget all the nodes' children.
 */
export class TryOrForgetNodeHandler implements NodeHandler {
    constructor(private readonly handler: NodeHandler) {
    }

    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile) {
        /* istanbul ignore next */
        if (!Node.isSourceFile(currentNode))
            throw new errors.InvalidOperationError(`Can only use a ${nameof(TryOrForgetNodeHandler)} with a source file.`);

        try {
            this.handler.handleNode(currentNode, newNode, newSourceFile);
        } catch (ex) {
            currentNode._context.logger.warn("Could not replace tree, so forgetting all nodes instead. Message: " + ex);
            // forget all the source file's nodes
            currentNode.getChildSyntaxListOrThrow().forget();
            // replace the source file with the temporary source file
            currentNode._context.compilerFactory.replaceCompilerNode(currentNode, newNode);
        }
    }
}
