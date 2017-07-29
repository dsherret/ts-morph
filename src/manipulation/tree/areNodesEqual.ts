import {Node} from "./../../compiler";

export function areNodesEqual(a: Node | undefined, b: Node | undefined) {
    if (a == null && b == null)
        return true;
    if (a == null || b == null)
        return false;
    if (a.getPos() === b.getPos() && a.getKind() === b.getKind())
        return true;
    return false;
}
