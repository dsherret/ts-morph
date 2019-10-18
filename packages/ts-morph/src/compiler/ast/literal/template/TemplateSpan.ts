import { ts } from "@ts-morph/common";
import { Node } from "../../common";
import { ExpressionedNode } from "../../expression";
import { TemplateMiddle } from "./TemplateMiddle";
import { TemplateTail } from "./TemplateTail";

export const TemplateSpanBase = ExpressionedNode(Node);
export class TemplateSpan extends TemplateSpanBase<ts.TemplateSpan> {
    /**
     * Gets the template literal.
     */
    getLiteral(): TemplateMiddle | TemplateTail {
        return this._getNodeFromCompilerNode(this.compilerNode.literal);
    }
}
