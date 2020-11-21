import { ts } from "@ts-morph/common";
import { JSDocTypeExpressionableTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocSeeTagBase = JSDocTypeExpressionableTag(JSDocTag);
/**
 * JS doc "see" tag node.
 */
export class JSDocSeeTag extends JSDocSeeTagBase<ts.JSDocSeeTag> {
    // todo: helper methods
}
