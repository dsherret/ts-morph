/* barrel:ignore */
import { ObjectUtils } from "../../utils";
import { Node } from "./common/Node";

/** @internal */
export function callBaseGetStructure<T>(basePrototype: any, node: Node, structure: MakeRequired<T> | undefined): any {
    let newStructure: T;
    if (basePrototype.getStructure != null)
        newStructure = basePrototype.getStructure.call(node);
    else
        newStructure = {} as any;

    if (structure != null)
        ObjectUtils.assign(newStructure, structure);

    return newStructure;
}
