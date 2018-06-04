import { ts } from "../../typescript";
import { JSDocPropertyLikeTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocParameterTagBase = JSDocPropertyLikeTag(JSDocTag);
/**
 * JS doc parameter tag node.
 */
export class JSDocParameterTag extends JSDocParameterTagBase<ts.JSDocParameterTag> {
}
