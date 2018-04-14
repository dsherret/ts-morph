import { ts } from "../../../typescript";
import { LiteralLikeNode } from "../../base";
import { Node } from "../../common";

export const TemplateMiddleBase = LiteralLikeNode(Node);
export class TemplateMiddle extends TemplateMiddleBase<ts.TemplateMiddle> {
}
