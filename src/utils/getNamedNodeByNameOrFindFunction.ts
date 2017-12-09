import {NamedNode, DeclarationNamedNode, PropertyNamedNode, Decorator} from "./../compiler";
import {ArrayUtils} from "./../utils";

export type NamedNodeByNameOrFindFunctionSupportedTypes = NamedNode | DeclarationNamedNode | PropertyNamedNode | Decorator;
export function getNamedNodeByNameOrFindFunction<T extends NamedNodeByNameOrFindFunctionSupportedTypes>(items: T[], nameOrFindFunc: ((declaration: T) => boolean) | string) {
    let findFunc: (declaration: T) => boolean;

    if (typeof nameOrFindFunc === "string")
        findFunc = dec => dec.getName() === nameOrFindFunc;
    else
        findFunc = nameOrFindFunc;

    return ArrayUtils.find(items, findFunc);
}

export function getNotFoundErrorMessageForNameOrFindFunction(findName: string, nameOrFindFunction: string | Function) {
    if (typeof nameOrFindFunction === "string")
        return `Expected to find ${findName} named '${nameOrFindFunction}'.`;
    return `Expected to find ${findName} that matched the provided condition.`;
}
