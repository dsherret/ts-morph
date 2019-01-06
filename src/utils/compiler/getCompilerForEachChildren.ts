import { ts } from "../../typescript";

export function getCompilerForEachChildren(node: ts.Node) {
    const children: ts.Node[] = [];
    node.forEachChild(child => {
        children.push(child);
    });
    return children;
}
