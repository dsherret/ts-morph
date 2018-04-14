import { Node } from "../../compiler";

export function getNodeOrNodesToReturn<T extends Node>(nodes: T[], index: number, length: number) {
    return length > 0 ? getNodesToReturn(nodes, index, length) : nodes[index];
}

export function getNodesToReturn<T extends Node>(nodes: T[], index: number, length: number) {
    return nodes.slice(index, index + length);
}
