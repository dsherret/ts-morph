import { ts } from "@ts-morph/common";
import { LiteralLikeNode } from "../../base";
import { Node } from "../../common";

export const TemplateHeadBase = LiteralLikeNode(Node);
export class TemplateHead extends TemplateHeadBase<ts.TemplateHead> {
}
