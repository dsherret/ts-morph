import {ts} from "./../../typescript";
import {JSDocTag} from "./JSDocTag";
import {JSDocPropertyLikeTag} from "./base";

export const JSDocParameterTagBase = JSDocPropertyLikeTag(JSDocTag);
/**
 * JS doc parameter tag node.
 */
export class JSDocParameterTag extends JSDocParameterTagBase<ts.JSDocParameterTag> {
}
