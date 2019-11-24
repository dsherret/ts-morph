import { Node } from "../../compiler";

export function getNodesToReturn<T extends Node>(oldChildren: T[] | number, newChildren: T[], index: number, allowCommentNodes: boolean) {
    const oldChildCount = typeof oldChildren === "number" ? oldChildren : oldChildren.length;
    const newLength = newChildren.length - oldChildCount;
    const result: T[] = [];
    for (let i = 0; i < newLength; i++) {
        const currentChild = newChildren[index + i];
        if (allowCommentNodes || !Node.isCommentNode(currentChild))
            result.push(currentChild);
    }
    return result;
}
