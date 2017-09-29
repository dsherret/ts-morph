import {NamedNode} from "./../compiler/base/name/NamedNode";
import {DeclarationNamedNode} from "./../compiler/base/name/DeclarationNamedNode";

export function getNamedNodeByNameOrFindFunction<T extends NamedNode | DeclarationNamedNode>(items: T[], nameOrFindFunc: ((declaration: T) => boolean) | string) {
    let findFunc: (declaration: T) => boolean;

    if (typeof nameOrFindFunc === "string")
        findFunc = dec => dec.getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;

    return items.find(findFunc);
}

export function getNotFoundErrorMessageForNameOrFindFunction(findName: string, nameOrFindFunction: string | Function) {
    if (typeof nameOrFindFunction === "string")
        return `Expected to find ${findName} named '${nameOrFindFunction}'.`;
    return `Expected to find ${findName} that matched the provided condition.`;
}
