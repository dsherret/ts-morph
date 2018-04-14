import { Node } from "../../compiler";
import { ts } from "../../typescript";

/**
 * Handler for replacing node.
 */
export interface NodeHandler {
    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile): void;
}
