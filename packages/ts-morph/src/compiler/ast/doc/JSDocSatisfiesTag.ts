import { ts } from "@ts-morph/common";
import { JSDocTypeExpressionableTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocSatisfiesTagBase = JSDocTypeExpressionableTag(JSDocTag);
/**
 * JS doc satifiest tag.
 */
export class JSDocSatisfiesTag extends JSDocSatisfiesTagBase<ts.JSDocSatisfiesTag> {
}
