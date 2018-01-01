import {Node} from "./../../compiler";

export function getNodeOrNodesToReturn<T extends Node>(nodes: T[], index: number, length: number) {
    return length > 0 ? nodes.slice(index, index + length) : nodes[index];
}
