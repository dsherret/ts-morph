import { ts } from "@ts-morph/common";
import { LiteralLikeNode } from "../../base";
import { Node } from "../../common";

export const TemplateMiddleBase = LiteralLikeNode(Node);
export class TemplateMiddle extends TemplateMiddleBase<ts.TemplateMiddle> {
}
