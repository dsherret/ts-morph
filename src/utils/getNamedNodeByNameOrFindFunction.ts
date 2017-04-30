import {NamedNode} from "./../compiler/base/name/NamedNode";

export function getNamedNodeByNameOrFindFunction<T extends NamedNode>(items: T[], nameOrFindFunc: ((declaration: T) => boolean) | string) {
    let findFunc: (declaration: T) => boolean;

    if (typeof nameOrFindFunc === "string")
        findFunc = dec => dec.getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;

    return items.find(findFunc);
}
