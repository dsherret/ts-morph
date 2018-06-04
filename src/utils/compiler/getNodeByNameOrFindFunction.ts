import { Node } from "../../compiler";
import { ArrayUtils } from "../ArrayUtils";

export function getNodeByNameOrFindFunction<T extends Node>(items: T[], nameOrFindFunc: ((declaration: T) => boolean) | string) {
    let findFunc: (declaration: T) => boolean;

    if (typeof nameOrFindFunc === "string")
        findFunc = dec => (dec as any).getName != null && (dec as any).getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;

    return ArrayUtils.find(items, findFunc);
}

export function getNotFoundErrorMessageForNameOrFindFunction(findName: string, nameOrFindFunction: string | Function) {
    if (typeof nameOrFindFunction === "string")
        return `Expected to find ${findName} named '${nameOrFindFunction}'.`;
    return `Expected to find ${findName} that matched the provided condition.`;
}
