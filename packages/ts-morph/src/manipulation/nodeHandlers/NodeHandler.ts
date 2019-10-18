import { ts } from "@ts-morph/common";
import { Node } from "../../compiler";

/**
 * Handler for replacing node.
 */
export interface NodeHandler {
    handleNode(currentNode: Node, newNode: ts.Node, newSourceFile: ts.SourceFile): void;
}
