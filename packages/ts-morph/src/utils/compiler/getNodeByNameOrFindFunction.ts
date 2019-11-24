import { Node } from "../../compiler";

export function getNodeByNameOrFindFunction<T extends Node>(items: T[], nameOrFindFunc: ((declaration: T) => boolean) | string) {
    let findFunc: (declaration: T) => boolean;

    if (typeof nameOrFindFunc === "string")
        findFunc = dec => nodeHasName(dec, nameOrFindFunc);
    else
        findFunc = nameOrFindFunc;

    return items.find(findFunc);
}

export function nodeHasName(node: Node, name: string): boolean {
    if ((node as any).getNameNode == null)
        return false;
    const nameNode = (node as any).getNameNode() as Node;
    if (nameNode == null)
        return false;
    if (Node.isArrayBindingPattern(nameNode) || Node.isObjectBindingPattern(nameNode))
        return nameNode.getElements().some(element => nodeHasName(element, name));
    const nodeName = (node as any).getName != null ? (node as any).getName() : nameNode.getText();
    return nodeName === name;
}

export function getNotFoundErrorMessageForNameOrFindFunction(findName: string, nameOrFindFunction: string | Function) {
    if (typeof nameOrFindFunction === "string")
        return `Expected to find ${findName} named '${nameOrFindFunction}'.`;
    return `Expected to find ${findName} that matched the provided condition.`;
}
