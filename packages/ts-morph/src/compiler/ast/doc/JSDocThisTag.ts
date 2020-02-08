import { ts } from "@ts-morph/common";
import { JSDocTypeExpressionableTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocThisTagBase = JSDocTypeExpressionableTag(JSDocTag);
/**
 * JS doc this tag node.
 */
export class JSDocThisTag extends JSDocThisTagBase<ts.JSDocThisTag> {
}
