import { ts } from "../../typescript";
import { JSDocTag } from "./JSDocTag";
import { JSDocPropertyLikeTag } from "./base";

export const JSDocPropertyTagBase = JSDocPropertyLikeTag(JSDocTag);
/**
 * JS doc property tag node.
 */
export class JSDocPropertyTag extends JSDocPropertyTagBase<ts.JSDocPropertyTag> {
}
