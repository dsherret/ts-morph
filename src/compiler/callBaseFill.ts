/* barrel:ignore */
import { Node } from "./common";

// todo: add code verification to ensure all fill functions call this

/** @internal */
export function callBaseFill(basePrototype: any, node: Node, structure: any) {
    if (basePrototype.fill != null)
        basePrototype.fill.call(node, structure);
}
