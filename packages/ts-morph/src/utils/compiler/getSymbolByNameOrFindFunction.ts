import { Symbol } from "../../compiler/symbols/Symbol";

// todo: merge with getNamedNodeByNameOrFindFunction
export function getSymbolByNameOrFindFunction(items: Symbol[], nameOrFindFunc: ((declaration: Symbol) => boolean) | string) {
    let findFunc: (declaration: Symbol) => boolean;

    if (typeof nameOrFindFunc === "string")
        findFunc = dec => dec.getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;

    return items.find(findFunc);
}
