/* barrel:ignore */
import { Node } from "./common";

/** @internal */
export function callBaseSet(basePrototype: any, node: Node, structure: any) {
    if (basePrototype.set != null)
        basePrototype.set.call(node, structure);
}
