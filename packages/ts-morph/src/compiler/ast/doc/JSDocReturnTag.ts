import { ts } from "@ts-morph/common";
import { JSDocTypeExpressionableTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocReturnTagBase = JSDocTypeExpressionableTag(JSDocTag);
/**
 * JS doc return tag node.
 */
export class JSDocReturnTag extends JSDocReturnTagBase<ts.JSDocReturnTag> {
}
