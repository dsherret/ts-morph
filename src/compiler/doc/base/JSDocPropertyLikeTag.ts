import { Constructor } from "../../../types";
import { Node } from "../../common";

export type JSDocPropertyLikeTagExtensionType = Node /*& ModifierableNode*/;

export interface JSDocPropertyLikeTag {
    // todo: methods
}

export function JSDocPropertyLikeTag<T extends Constructor<JSDocPropertyLikeTagExtensionType>>(Base: T): Constructor<JSDocPropertyLikeTag> & T {
    return class extends Base implements JSDocPropertyLikeTag {
        // todo: methods
    };
}
