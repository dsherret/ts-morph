import { Symbol } from "../../compiler/common/Symbol";
import { ArrayUtils } from "../ArrayUtils";

// todo: merge with getNamedNodeByNameOrFindFunction
export function getSymbolByNameOrFindFunction(items: Symbol[], nameOrFindFunc: ((declaration: Symbol) => boolean) | string) {
    let findFunc: (declaration: Symbol) => boolean;

    if (typeof nameOrFindFunc === "string")
        findFunc = dec => dec.getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;

    return ArrayUtils.find(items, findFunc);
}
