import {Node} from "./common";

// todo: add code verification to ensure all fill functions call this

/** @internal */
export function callBaseGetStructure<T>(basePrototype: any, node: Node, structure: MakeRequired<T>): any {
    let newStructure: T;
    if (basePrototype.getStructure != null)
        newStructure = basePrototype.getStructure.call(node);
    else
        newStructure = {} as any;

    Object.assign(newStructure, structure);

    return newStructure;
}
