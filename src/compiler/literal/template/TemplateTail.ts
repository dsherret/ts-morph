import { ts } from "../../../typescript";
import { LiteralLikeNode } from "../../base";
import { Node } from "../../common";

export const TemplateTailBase = LiteralLikeNode(Node);
export class TemplateTail extends TemplateTailBase<ts.TemplateTail> {
}
