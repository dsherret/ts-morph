import { ts } from "@ts-morph/common";
import { JSDocTypeExpressionableTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocThrowsTagBase = JSDocTypeExpressionableTag(JSDocTag);
/**
 * JS doc return tag node.
 */
export class JSDocThrowsTag extends JSDocThrowsTagBase<ts.JSDocThrowsTag> {
}
