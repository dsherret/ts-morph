import { Node } from "../../compiler";

export function getNodesToReturn<T extends Node>(nodes: T[], index: number, length: number) {
    return nodes.slice(index, index + length);
}
