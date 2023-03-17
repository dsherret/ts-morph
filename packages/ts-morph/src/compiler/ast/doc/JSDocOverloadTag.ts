import { ts } from "@ts-morph/common";
import { JSDocTypeExpressionableTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocOverloadTagBase = JSDocTypeExpressionableTag(JSDocTag);
/** JS doc overload tag. */
export class JSDocOverloadTag extends JSDocOverloadTagBase<ts.JSDocOverloadTag> {
}
