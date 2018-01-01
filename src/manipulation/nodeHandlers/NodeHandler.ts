import {Node} from "./../../compiler";

/**
 * Handler for replacing node.
 */
export interface NodeHandler {
    handleNode(currentNode: Node, newNode: Node): void;
}
